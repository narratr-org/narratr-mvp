// pages/dog/index.js
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function ChartPage() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState(null);

  const fetchData = async () => {
    const from = Math.floor(startDate.getTime() / 1000);
    const to = Math.floor(endDate.getTime() / 1000);

    const res = await fetch(`/api/chart?from=${from}&to=${to}`);
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

      <div style={{ margin: '1rem 0' }}>
        <label>시작일: </label>
        <DatePicker selected={startDate} onChange={date => setStartDate(date)} />

        <label style={{ marginLeft: '1rem' }}>종료일: </label>
        <DatePicker selected={endDate} onChange={date => setEndDate(date)} />

        <button style={{ marginLeft: '1rem' }} onClick={fetchData}>조회</button>
      </div>

      {chartData && <Line data={chartData} />}
    </div>
  );
}
