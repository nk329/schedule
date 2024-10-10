import React, { useState } from 'react';

function AddEventForm({ selectedEvent, calendar }) {
  const [summary, setSummary] = useState(''); // 일정 제목 상태
  const [description, setDescription] = useState(''); // 일정 설명 상태
  const [startDate, setStartDate] = useState(selectedEvent ? selectedEvent.start : ''); // 시작일 상태
  const [endDate, setEndDate] = useState(selectedEvent ? selectedEvent.end : ''); // 종료일 상태

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 동작 방지

    // 이벤트 객체 생성
    const event = {
      summary, // 일정 제목
      description, // 일정 설명
      start: {
        dateTime: new Date(startDate).toISOString(), // 시작일을 ISO 형식으로 변환
        timeZone: 'Asia/Seoul', // 서울 시간대 설정
      },
      end: {
        dateTime: new Date(endDate).toISOString(), // 종료일을 ISO 형식으로 변환
        timeZone: 'Asia/Seoul', // 서울 시간대 설정
      },
    };

    // 서버에 이벤트 추가 요청
    fetch('http://localhost:3001/api/add-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // 요청 데이터 형식 JSON
      },
      body: JSON.stringify(event), // 이벤트 데이터 JSON으로 변환
    })
      .then((response) => response.json()) // 응답을 JSON으로 변환
      .then((data) => {
        console.log('Event added:', data); // 서버로부터 응답 데이터 출력
        alert('일정이 추가되었습니다.'); // 성공 알림
        if (calendar) {
          calendar.refetchEvents(); // 캘린더 새로고침
        }
      })
      .catch((err) => {
        console.error('Failed to add event:', err); // 에러 출력
        alert('일정 추가 중 오류가 발생했습니다.'); // 오류 알림
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        제목:
        <input 
          type="text" 
          value={summary} 
          onChange={(e) => setSummary(e.target.value)} // 제목 입력 값 상태 업데이트
          required
        />
      </label>
      <label>
        내용:
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} // 설명 입력 값 상태 업데이트
          required
        />
      </label>
      <label>
        시작일:
        <input 
          type="datetime-local" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} // 시작일 입력 값 상태 업데이트
          required
        />
      </label>
      <label>
        종료일:
        <input 
          type="datetime-local" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} // 종료일 입력 값 상태 업데이트
          required
        />
      </label>
      <button type="submit">일정 추가</button> {/* 일정 추가 버튼 */}
    </form>
  );
}

export default AddEventForm;
