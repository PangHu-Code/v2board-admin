import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Input, Popconfirm, Table } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { unwrap } from '@/api/request'
import { addGuardBlacklist, fetchGuardBlacklist, removeGuardBlacklist } from '@/api/services/insiderGuard'
import { message } from '@/app/staticApi'
import { guardKeys, Section } from './shared'

export function Blacklist() {
  const client = useQueryClient()
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const list = useQuery({ queryKey: guardKeys.blacklist, queryFn: () => unwrap(fetchGuardBlacklist()) })
  const add = async () => {
    if (!email.trim()) return message.error('请输入邮箱')
    const result = await addGuardBlacklist(email.trim(), note.trim())
    if (result.code !== 200 || result.data !== true) return
    setEmail(''); setNote(''); await client.invalidateQueries({ queryKey: guardKeys.blacklist }); message.success('已加入黑名单')
  }
  return <Section title="黑名单用户" extra={<Button onClick={() => void list.refetch()}>刷新</Button>}>
    <div className="d-flex" style={{ gap: 8, marginBottom: 16 }}><Input placeholder="用户邮箱" value={email} onChange={(e) => setEmail(e.target.value)} /><Input placeholder="备注" value={note} onChange={(e) => setNote(e.target.value)} /><Button type="primary" icon={<PlusOutlined />} onClick={() => void add()}>添加</Button></div>
    <Table rowKey="id" loading={list.isLoading} dataSource={list.data ?? []} pagination={{ pageSize: 20 }} columns={[{ title: '邮箱', dataIndex: 'email' }, { title: '备注', dataIndex: 'note' }, { title: '操作', render: (_: unknown, row) => <Popconfirm title="确定移除？" onConfirm={async () => { const r = await removeGuardBlacklist(row.id); if (r.code === 200) { await client.invalidateQueries({ queryKey: guardKeys.blacklist }); message.success('已移除') } }}><Button danger size="small" icon={<DeleteOutlined />}>移除</Button></Popconfirm> }]} />
  </Section>
}
