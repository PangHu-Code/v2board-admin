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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const list = useQuery({ queryKey: [...guardKeys.blacklist, page, search], queryFn: () => unwrap(fetchGuardBlacklist({ page, page_size: 10, search })) })
  const add = async () => {
    const emails = email.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean)
    if (!emails.length) return message.error('请输入邮箱')
    const result = await addGuardBlacklist(emails, note.trim())
    if (result.code !== 200 || result.data !== true) return
    setEmail(''); setNote(''); await client.invalidateQueries({ queryKey: guardKeys.blacklist }); message.success(`已加入 ${emails.length} 个黑名单邮箱`)
  }
  return <Section title="黑名单用户" extra={<Button onClick={() => void list.refetch()}>刷新</Button>}>
    <div style={{ marginBottom: 16 }}><Input.TextArea rows={4} placeholder="用户邮箱，支持换行、逗号或分号批量添加" value={email} onChange={(e) => setEmail(e.target.value)} /><div className="d-flex" style={{ gap: 8, marginTop: 8 }}><Input placeholder="统一备注（可选）" value={note} onChange={(e) => setNote(e.target.value)} /><Button type="primary" icon={<PlusOutlined />} onClick={() => void add()}>批量添加</Button></div></div>
    <Input.Search placeholder="搜索邮箱或备注" allowClear value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} onSearch={() => setPage(1)} style={{ marginBottom: 12 }} />
    <Table rowKey="id" loading={list.isLoading} dataSource={list.data?.items ?? []} pagination={{ current: page, pageSize: 10, total: list.data?.total ?? 0, onChange: setPage, showSizeChanger: false }} columns={[{ title: '邮箱', dataIndex: 'email' }, { title: '备注', dataIndex: 'note' }, { title: '操作', render: (_: unknown, row) => <Popconfirm title="确定移除？" onConfirm={async () => { const r = await removeGuardBlacklist(row.id); if (r.code === 200) { await client.invalidateQueries({ queryKey: guardKeys.blacklist }); message.success('已移除') } }}><Button danger size="small" icon={<DeleteOutlined />}>移除</Button></Popconfirm> }]} />
  </Section>
}
