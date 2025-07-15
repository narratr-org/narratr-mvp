// pages/dog/index.js
export const runtime = 'edge';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TagKolFilter from '../../components/TagKolFilter';
import { TAGS } from '../../lib/tags';
import { KOLS } from '../../lib/kols';

const DogChart = dynamic(() => import('@/components/DogChart'), { ssr: false });


export default function ChartPage() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState(null);
  const [filters, setFilters] = useState({ tag: '', kol: '' });

  const fetchData = async () => {
    const from = Math.floor(startDate.getTime() / 1000);
    const to = Math.floor(endDate.getTime() / 1000);

    const params = new URLSearchParams({
      from: String(from),
      to: String(to),
      tag: filters.tag,
      kol: filters.kol,
    });

    const res = await fetch(`/api/chart?${params.toString()}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      const labels = data.map(item => new Date(item.ts).toLocaleDateString());
      const prices = data.map(item => item.close);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Close Price',
            data: prices,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.3,
            fill: false
          }
        ]
      });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📊 DOG 가격 차트</h1>

      <TagKolFilter tags={TAGS} kols={KOLS} onChange={setFilters} />

      <div style={{ margin: '1rem 0' }}>
        <label>시작일: </label>
        <DatePicker selected={startDate} onChange={date => setStartDate(date)} />

        <label style={{ marginLeft: '1rem' }}>종료일: </label>
        <DatePicker selected={endDate} onChange={date => setEndDate(date)} />

        <button style={{ marginLeft: '1rem' }} onClick={fetchData}>조회</button>
      </div>

      {chartData && <DogChart data={chartData} />}
    </div>
  );
}
