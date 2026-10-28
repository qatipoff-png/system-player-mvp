'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Crosshair, LockKeyhole, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [recovering, setRecovering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('setup')) setMessage('Сначала добавьте URL и ключ Supabase в .env.local, затем перезапустите приложение.')
    else if (params.get('confirmation')) setMessage('Ссылка подтверждения недействительна или устарела. Попробуйте зарегистрироваться ещё раз.')
    else if (params.get('recovery') === 'sent') setMessage('Письмо для восстановления отправлено. Проверьте входящие и папку «Спам».')
    else if (params.get('recovery') === 'failed') setMessage('Не удалось подтвердить ссылку восстановления. Запросите письмо ещё раз.')
  }, [])

  async function sendResetLink() {
    if (!email.trim()) {
      setMessage('Сначала введите адрес электронной почты.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      setMessage(error ? `Не удалось отправить письмо: ${error.message}` : 'Письмо для восстановления отправлено. Проверьте входящие и папку «Спам».')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось связаться с Supabase. Проверьте подключение и настройки проекта.')
    } finally {
      setBusy(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const supabase = createClient()
      const result = mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
      if (result.error) {
        setMessage(result.error.message)
        return
      }
      if (mode === 'signup' && !result.data.session) {
        setMessage('Аккаунт создан. Проверьте почту и подтвердите адрес, затем войдите.')
        return
      }
      window.location.assign('/')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось связаться с Supabase. Проверьте подключение и настройки проекта.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <section className="panel w-full max-w-md p-6 md:p-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="h-11 w-11 grid place-items-center border border-cyan-400/60 text-cyan-300 shadow-glow"><Crosshair size={23}/></div>
          <div><p className="eyebrow">SYSTEM // PLAYER ACCESS</p><h1 className="text-2xl font-black tracking-widest">ОХОТНИК</h1></div>
        </div>
        <p className="eyebrow">AUTHENTICATION REQUIRED</p>
        <h2 className="text-xl font-bold mt-2">{recovering ? 'Восстановление пароля' : mode === 'signin' ? 'Вход в систему' : 'Регистрация охотника'}</h2>
        <p className="text-sm text-slate-400 mt-2">Ваш игровой прогресс пока хранится только на этом устройстве.</p>
        {message && <p role="status" className="mt-4 border border-cyan-400/30 bg-cyan-950/30 p-3 text-sm text-cyan-100">{message}</p>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-xs tracking-wider text-slate-400">EMAIL
            <span className="relative block mt-2"><Mail size={16} className="absolute left-3 top-3 text-cyan-500"/><input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-black/40 border border-cyan-900 p-3 pl-10 text-sm outline-none focus:border-cyan-300" placeholder="hunter@example.com"/></span>
          </label>
          {!recovering && <label className="block text-xs tracking-wider text-slate-400">ПАРОЛЬ
            <span className="relative block mt-2"><LockKeyhole size={16} className="absolute left-3 top-3 text-cyan-500"/><input required minLength={8} type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black/40 border border-cyan-900 p-3 pl-10 text-sm outline-none focus:border-cyan-300" placeholder="Не менее 8 символов"/></span>
          </label>}
          {recovering ? <button type="button" disabled={busy} onClick={sendResetLink} className="w-full bg-cyan-400 text-slate-950 font-black tracking-widest py-3 hover:bg-cyan-200 disabled:opacity-50">{busy ? 'ОТПРАВКА…' : 'ОТПРАВИТЬ ССЫЛКУ'}</button> : <button disabled={busy} className="w-full bg-cyan-400 text-slate-950 font-black tracking-widest py-3 hover:bg-cyan-200 disabled:opacity-50">{busy ? 'ПОДОЖДИТЕ…' : mode === 'signin' ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}</button>}
        </form>
        {mode === 'signin' && !recovering && <button onClick={()=>{setRecovering(true);setMessage('')}} className="w-full mt-3 py-2 text-sm text-slate-300 hover:text-cyan-100">Забыли пароль?</button>}
        <button onClick={()=>{if(recovering){setRecovering(false)}else{setMode(mode === 'signin' ? 'signup' : 'signin')}setMessage('')}} className="w-full mt-2 py-2 text-sm text-cyan-300 hover:text-cyan-100">
          {recovering ? 'Вернуться ко входу' : mode === 'signin' ? 'Впервые здесь? Создать аккаунт' : 'Уже есть аккаунт? Войти'}
        </button>
      </section>
    </main>
  )
}


