type Item = { id: string, label: string }
type Props = { value: string, onChange: (id:string)=>void, items: Item[] }

export default function Tabs({value, onChange, items}: Props){
  return (
    <div className="tabbar" role="tablist">
      {items.map(it=> (
        <button
          key={it.id}
          className="tab"
          role="tab"
          aria-selected={value===it.id}
          onClick={()=> onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}
