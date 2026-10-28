'use client'

import { FormEvent, useEffect, useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data, error }) => {
      setReady(true)
      if (error || !data.session) setMessage('Ссылка восстановления недействительна или устарела. Запросите новую на странице входа.')
    })
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) {
      setMessage(`Не удалось изменить пароль: ${error.message}`)
      return
    }
    setConfirmed(true)
    setMessage('Пароль изменён. Теперь можно продолжить работу в системе.')
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <section className="panel w-full max-w-md p-6 md:p-8">
        <p className="eyebrow">SYSTEM // ACCOUNT RECOVERY</p>
        <h1 className="text-2xl font-black mt-2">Новый пароль</h1>
        <p className="text-sm text-slate-400 mt-2">Придумайте пароль длиной не менее 8 символов.</p>
        {message && <p role="status" className="mt-4 border border-cyan-400/30 bg-cyan-950/30 p-3 text-sm text-cyan-100">{message}</p>}
        {!confirmed && <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-xs tracking-wider text-slate-400">НОВЫЙ ПАРОЛЬ
            <span className="relative block mt-2"><LockKeyhole size={16} className="absolute left-3 top-3 text-cyan-500"/><input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black/40 border border-cyan-900 p-3 pl-10 text-sm outline-none focus:border-cyan-300" placeholder="Не менее 8 символов"/></span>
          </label>
          <button disabled={busy || !ready || Boolean(message)} className="w-full bg-cyan-400 text-slate-950 font-black tracking-widest py-3 hover:bg-cyan-200 disabled:opacity-50">{busy ? 'СОХРАНЯЕМ…' : 'ИЗМЕНИТЬ ПАРОЛЬ'}</button>
        </form>}
        {confirmed && <a href="/" className="block mt-5 text-center bg-cyan-400 text-slate-950 font-black tracking-widest py-3 hover:bg-cyan-200">ПЕРЕЙТИ В СИСТЕМУ</a>}
        {!confirmed && message && <a href="/login" className="block mt-4 text-center text-sm text-cyan-300 hover:text-cyan-100">Вернуться ко входу</a>}
      </section>
    </main>
  )
}
