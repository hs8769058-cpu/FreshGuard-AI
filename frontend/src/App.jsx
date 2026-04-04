import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // 연결용 클라이언트 파일
import './App.css'; // 현성님의 스타일 파일!

function App() {
  // DB에서 가져온 신선도 데이터 상자들
  const [temp, setTemp] = useState(0); 
  const [status, setStatus] = useState(' Checking... ');

  useEffect(() => {
    // 1. 처음 페이지 켰을 때 가장 최근 데이터 가져오기
    const fetchData = async () => {
      const { data } = await supabase
        .from('freshness_data')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setTemp(data[0].percentage);
        setStatus(data[0].status);
      }
    };
    fetchData();

    // 2. 실시간 감시 (DB에 변화 생기면 화면 슥- 업데이트)
    const channel = supabase
      .channel('freshness_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'freshness_data' }, (payload) => {
        console.log('실시간 데이터 변화 감지!', payload);
        if (payload.new) {
          setTemp(payload.new.percentage);
          setStatus(payload.new.status);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 상태값('Bad', 'Fresh' 등)에 따라 디자인 색상을 바꿔주는 보너스 마법!
  const getStatusStyle = () => {
    if (status === 'Fresh') return { card: 'fresh-card', text: '매우 신선', icon: '✅', valueColor: '#2ecc71' };
    if (status === 'Warning') return { card: 'warning-card', text: '주의 필요', icon: '⚠️', valueColor: '#f1c40f' };
    if (status === 'Bad') return { card: 'bad-card', text: '매우 나쁨', icon: '🚨', valueColor: '#e74c3c' };
    return { card: 'default-card', text: status, icon: '❓', valueColor: '#7f8c8d' }; // 데이터 대기 중
  };

  const styleMap = getStatusStyle();

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">FreshGuard <span style={{color: '#2ecc71'}}>AI</span></h1>
        <div className="icon-bell">🔔</div>
      </header>

      <main className="main-content">
        {/* DB 상태값에 따라 색깔이 바뀌는 간지나는 상자 */}
        <section className={`status-card ${styleMap.card}`}>
          <div className="status-header">
            <span className="status-icon">{styleMap.icon}</span>
            <h2>보관함: {styleMap.text}</h2>
          </div>
          <p>AI 분석 결과: 실시간으로 신선도 데이터를 수신하고 있습니다.</p>
        </section>

        <section className="sensor-grid">
          <div className="sensor-item">
            <span className="sensor-label">🌡️ 신선도</span>
            {/* DB의 percentage 숫자에 따라 색깔이 변함 */}
            <span className="sensor-value" style={{ color: styleMap.valueColor }}>
              {temp}%
            </span>
          </div>
          <div className="sensor-item">
            <span className="sensor-label">💧 습도</span>
            <span className="sensor-value">65%</span>
          </div>
          <div className="sensor-item">
            <span className="sensor-label">🍃 에틸렌</span>
            <span className="sensor-value">Safe</span>
          </div>
        </section>

        <section className="fruit-list">
          <h3>보관함 내부 과일</h3>
          <div className="fruit-item">
            <span>🍎 사과</span>
            <span className="fruit-status" style={{ color: styleMap.valueColor }}>{styleMap.text}</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;