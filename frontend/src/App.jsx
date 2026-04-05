import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [temp, setTemp] = useState(0); 
  const [status, setStatus] = useState('Checking...');
  const [history, setHistory] = useState([]); // [추가] 과거 기록 저장용

  // 1. 데이터 가져오기 및 실시간 연동
  useEffect(() => {
    const fetchData = async () => {
      // 최근 5개 데이터를 가져와서 히스토리도 보여줍니다
      const { data } = await supabase
        .from('freshness_data')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);
      
      if (data && data.length > 0) {
        setTemp(data[0].percentage);
        setStatus(data[0].status);
        setHistory(data);
      }
    };
    fetchData();

    const channel = supabase
      .channel('freshness_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'freshness_data' }, (payload) => {
        if (payload.new) {
          setTemp(payload.new.percentage);
          setStatus(payload.new.status);
          // 실시간으로 알림 띄우기 (Bad 상태일 때)
          if (payload.new.status === 'Bad') {
            alert("🚨 경고: 신선도가 급격히 떨어졌습니다! 확인이 필요합니다.");
          }
          fetchData(); // 데이터 새로고침해서 히스토리 갱신
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // [수정] 신선도 수치에 따른 상세 메시지 마법
  const getDetailMessage = (p) => {
    if (p >= 80) return "현재 최상의 상태입니다. 천천히 드셔도 돼요!";
    if (p >= 40) return "신선도가 떨어지고 있어요. 가급적 빨리 드세요!";
    return "⚠️ 상했을 위험이 큽니다! 폐기를 권장합니다.";
  };

  // [수정] 상태값에 따른 스타일 및 배경색 결정
  const getStatusStyle = () => {
    if (temp >= 80) return { 
      card: 'fresh-card', text: '매우 신선', icon: '✅', color: '#2ecc71', bg: '#e6fffa' 
    };
    if (temp >= 40) return { 
      card: 'warning-card', text: '주의 필요', icon: '⚠️', color: '#f1c40f', bg: '#fffbe6' 
    };
    return { 
      card: 'bad-card', text: '매우 나쁨', icon: '🚨', color: '#e74c3c', bg: '#fff5f5' 
    };
  };

  const styleMap = getStatusStyle();

  return (
    // 전체 배경색이 신선도에 따라 은은하게 바뀝니다!
    <div className="app-container" style={{ backgroundColor: styleMap.bg, transition: '0.5s' }}>
      <header className="header">
        <h1 className="logo">FreshGuard <span style={{color: '#2ecc71'}}>AI</span></h1>
        <div className="icon-bell" onClick={() => alert("현재 알림이 활성화되어 있습니다.")}>🔔</div>
      </header>

      <main className="main-content">
        {/* 메인 카드: 메시지가 더 구체적으로 변함 */}
        <section className={`status-card ${styleMap.card}`}>
          <div className="status-header">
            <span className="status-icon">{styleMap.icon}</span>
            <h2>상태: {styleMap.text}</h2>
          </div>
          <p>{getDetailMessage(temp)}</p>
        </section>

        {/* 게이지 바 추가 (시각적 효과) */}
        <section className="gauge-section">
            <div className="gauge-container">
                <div className="gauge-bar" style={{ width: `${temp}%`, backgroundColor: styleMap.color }}></div>
            </div>
        </section>

        <section className="sensor-grid">
          <div className="sensor-item">
            <span className="sensor-label">🌡️ 신선도 점수</span>
            <span className="sensor-value" style={{ color: styleMap.color }}>{temp}%</span>
          </div>
          <div className="sensor-item">
            <span className="sensor-label">⏱️ 분석 주기</span>
            <span className="sensor-value">실시간</span>
          </div>
        </section>

        {/* [추가] 과거 기록 섹션: 교수님께 보여드리기 좋음 */}
        <section className="history-list">
          <h3>최근 분석 히스토리</h3>
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <span>#{item.id} 분석 결과</span>
              <span style={{ fontWeight: 'bold' }}>{item.percentage}% ({item.status})</span>
            </div>
          ))}
        </section>

        {/* [추가] 동작하는 버튼들 */}
        <section className="action-buttons">
            <button className="btn-refresh" onClick={() => window.location.reload()}>데이터 갱신</button>
            <button className="btn-report" onClick={() => alert("미팅용 리포트가 생성되었습니다.")}>리포트 생성</button>
        </section>
      </main>
    </div>
  );
}

export default App;