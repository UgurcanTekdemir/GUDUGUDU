import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LossBonusRequest {
  user_id?: string;
  loss_amount?: number;
  period_days?: number;
  should_grant?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request data - support both old format (userId) and new format (user_id)
    const requestData = await req.json()
    const user_id = requestData.user_id || requestData.userId
    const { loss_amount, period_days = 30, should_grant = true }: LossBonusRequest = requestData

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Kullanıcı ID gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate user losses using the existing function
    const { data: totalLosses, error: lossError } = await supabaseClient
      .rpc('calculate_user_losses', {
        p_user_id: user_id,
        p_days: period_days
      })

    if (lossError) {
      console.error('Loss calculation error:', lossError)
      // For test users or non-existent users, return 0 losses
      if (lossError.message?.includes('does not exist') || user_id === 'test-user') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            totalLoss: 0,
            isEligible: false,
            bonusAmount: 0,
            message: 'Test kullanıcısı veya geçersiz kullanıcı',
            error: 'Test user or invalid user'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ error: 'Kayıp hesaplanamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile for bonus calculation (users table)
    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('id, first_name, last_name, created_at, bonus_balance')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Kullanıcı profili bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Optional: skip duplicate within last 7 days if you store somewhere; if not, continue
    let recentBonus: any[] = []
    let bonusCheckError: any = null

    if (bonusCheckError) {
      console.error('Bonus check error:', bonusCheckError)
    }

    if (recentBonus && recentBonus.length > 0) {
      console.log(`User ${user_id} already has a recent loss bonus, skipping`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          totalLoss: totalLosses || 0,
          isEligible: false,
          bonusAmount: 0,
          message: 'Son 7 gün içinde zaten cashback bonusu alınmış',
          recent_bonus_date: recentBonus[0].created_at,
          lastClaimDate: recentBonus[0].created_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine loss bonus amount based on loss level
    let bonus_percentage = 0
    let max_bonus = 0

    if (totalLosses >= 5000) {
      bonus_percentage = 15 // 15% for high losses
      max_bonus = 2000
    } else if (totalLosses >= 2000) {
      bonus_percentage = 10 // 10% for medium losses
      max_bonus = 1000
    } else if (totalLosses >= 500) {
      bonus_percentage = 5 // 5% for small losses
      max_bonus = 250
    }

    // Only grant bonus if losses are significant enough
    if (bonus_percentage === 0 || totalLosses < 500) {
      console.log(`User ${user_id} losses (${totalLosses}) not significant enough for bonus`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          totalLoss: totalLosses || 0,
          isEligible: false,
          bonusAmount: 0,
          message: 'Kayıp miktarı cashback bonusu için yeterli değil',
          total_losses: totalLosses,
          required_minimum: 500,
          lastClaimDate: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate bonus amount
    const bonus_amount = Math.min((totalLosses * bonus_percentage) / 100, max_bonus)

    // If should_grant is false, just return calculation
    if (!should_grant) {
      return new Response(
        JSON.stringify({
          success: true,
          totalLoss: totalLosses || 0,
          isEligible: true,
          bonusAmount: bonus_amount,
          bonus_percentage: bonus_percentage,
          max_bonus: max_bonus,
          lastClaimDate: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Grant bonus by updating users.bonus_balance directly
    const currentBonusBalance = (profile?.bonus_balance as number) || 0
    const newBonusBalance = currentBonusBalance + bonus_amount
    const { error: balanceUpdateError } = await supabaseClient
      .from('users')
      .update({ bonus_balance: newBonusBalance })
      .eq('id', user_id)
    if (balanceUpdateError) {
      console.error('Bonus balance update error:', balanceUpdateError)
    }

    // Update user's bonus balance
    // Skip legacy profile updates and event logs for now

    // Create bonus event
    await supabaseClient
      .from('bonus_events')
      .insert({
        user_id: user_id,
        type: 'loss_bonus_claimed',
        payload: {
          bonus_amount: bonus_amount,
          total_losses: totalLosses,
          bonus_percentage: bonus_percentage,
          bonus_request_id: null
        }
      })

    // Log user behavior
    await supabaseClient
      .from('user_behavior_logs')
      .insert({
        user_id: user_id,
        action_type: 'loss_bonus_granted',
        metadata: {
          bonus_amount: bonus_amount,
          total_losses: totalLosses,
          bonus_percentage: bonus_percentage,
          bonus_request_id: bonusRequest.id
        },
        amount: bonus_amount
      })

    console.log(`Loss bonus granted: ${bonus_amount} to user ${user_id} for losses: ${totalLosses}`)

    return new Response(
      JSON.stringify({
        success: true,
        totalLoss: totalLosses || 0,
        isEligible: true,
        bonusAmount: bonus_amount,
        bonus_percentage: bonus_percentage,
        bonus_request_id: bonusRequest.id,
        message: `Tebrikler! ${bonus_percentage}% cashback bonusu hesabınıza yatırıldı (₺${bonus_amount})`,
        lastClaimDate: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Loss bonus calculation error:', error)
    return new Response(
      JSON.stringify({ error: 'Kayıp bonusu hesaplanırken hata oluştu' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})