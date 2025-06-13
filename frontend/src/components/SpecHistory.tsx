interface Props {
  specs: string[]
}

export default function SpecHistory({ specs }: Props) {
  return (
    <div className="h-60 overflow-y-auto border rounded p-4">
      <ol className="list-decimal list-inside text-sm marker:text-gray-400">
        {specs.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  )
}
