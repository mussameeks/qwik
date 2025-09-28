import dayjs from 'dayjs'

type Props = {
  value: dayjs.Dayjs
  onChange: (d: dayjs.Dayjs) => void
}

export default function DateFilter({value, onChange}: Props){
  // show 7 days window starting from the week's start (Monday depends on locale)
  const start = value.startOf('week')
  const days = Array.from({length:7}).map((_,i)=> start.add(i,'day'))

  return (
    <div className="datebar">
      <div className="container">
        <div className="date-scroller" role="tablist" aria-label="Pick a date">
          {days.map(d => {
            const sel = value.startOf('day').isSame(d.startOf('day'))
            return (
              <button
                key={d.toString()}
                className="date-pill"
                aria-selected={sel}
                role="tab"
                onClick={()=> onChange(d.startOf('day'))}
                title={d.format('dddd, MMM D YYYY')}
              >
                <div style={{fontWeight:600}}>{d.format('ddd D')}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
