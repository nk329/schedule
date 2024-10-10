import React, { useEffect, useState } from 'react';
import AddEventForm from './AddEventForm';
import Chatbot from './chatbot'; // 챗봇 컴포넌트 추가
import FullCalendar from '@fullcalendar/react'; // FullCalendar 컴포넌트 가져오기
import dayGridPlugin from '@fullcalendar/daygrid'; // dayGridPlugin 가져오기
import timeGridPlugin from '@fullcalendar/timegrid'; // timeGridPlugin 가져오기
import { format } from 'date-fns'; // date-fns 라이브러리에서 format 가져오기
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './App.css'; // 스타일 임포트

function App() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ content_title: '', description: '', location: '', start: '', end: '' });
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mouseX, setMouseX] = useState(undefined);
  const [mouseY, setMouseY] = useState(undefined);

  // 팝업 폼 표시 위치를 조정하는 메서드
  const handleShowForm = (event) => {
    event.stopPropagation(); // 이벤트 전파 방지
    setShowAddEventForm(!showAddEventForm);
  };

  // 일정 추가 핸들러
  const handleAddEvent = (dateStr) => {
    setNewEvent({ ...newEvent, start: dateStr, end: dateStr });
    setShowAddEventForm(true);
  };

  // 일정 삭제 핸들러
  const handleDelete = () => {
    if (selectedEvent) {
      const confirmed = window.confirm("정말로 이 이벤트를 삭제하시겠습니까?");
      if (confirmed) {
        handleConfirmDelete(selectedEvent.id); // 이벤트 삭제 로직 호출
      }
    }
  };

  // 일정 삭제 확정
  const handleConfirmDelete = (eventId) => {
    if (eventId) {
      fetch(`http://localhost:3001/api/delete-event/${eventId}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId));
            setSelectedEvent(null);
          } else {
            console.error('구글 캘린더 이벤트 삭제 실패');
          }
        })
        .catch((error) => {
          console.error('이벤트 삭제 중 오류 발생:', error);
        });
    }
  };

  // 이벤트 가져오기
  const fetchEvents = () => {
    fetch('http://localhost:3001/api/events')
      .then((response) => response.json())
      .then((data) => {
        const calendarEvents = data.map((event) => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          location: event.location || '',
          description: event.description || '',
        }));
        setEvents(calendarEvents);
      })
      .catch((error) => console.error('이벤트 가져오기 중 오류 발생:', error));
  };

  // 새 이벤트 저장 핸들러
  const handleSave = () => {
    const event = {
      title: `${newEvent.content_title} - ${newEvent.description}`,
      start: newEvent.start,
      end: newEvent.end,
      location: newEvent.location,
    };

    setEvents((prevEvents) => [...prevEvents, event]);
    setNewEvent({ content_title: '', description: '', location: '', start: '', end: '' });
    setShowAddEventForm(false);
  };

  // 이벤트 클릭 핸들러
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const { clientX: mouseX, clientY: mouseY } = clickInfo.jsEvent;
    setSelectedEvent(event);
    setMouseX(mouseX);
    setMouseY(mouseY - 90); // 90px 위로 이동
  };

  // 이벤트 세부 정보 표시
  const showEventDetails = () => {
    if (selectedEvent && mouseX !== undefined && mouseY !== undefined) {
      const startDate = selectedEvent.start && format(selectedEvent.start, 'HH:mm', { timeZone: 'Asia/Seoul' });
      const endDate = selectedEvent.end && format(selectedEvent.end, 'HH:mm', { timeZone: 'Asia/Seoul' });
      
      return (
        <div className="event-details" style={{ position: 'absolute', left: mouseX, top: mouseY }}>
          <h2>{selectedEvent.title}</h2>
          <p>내용: {selectedEvent.extendedProps.description}</p>
          <div className='time_place'>
            <p>시간: {startDate} ~ {endDate}</p>
          </div>
          <button onClick={() => setSelectedEvent(null)}>닫기</button>
          <button onClick={handleDelete}>삭제</button>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="app-container">
      <div className="calendar-container">
        <div>
          <button onClick={handleShowForm}className="add-event-button">
          <FontAwesomeIcon icon={faPlus} size="2x" />
        </button>

          {/* 팝업 폼 */}
          {showAddEventForm && (
          <div className="popup-form" style={{ position: 'absolute', top: '50px', left: '70px', zIndex: 1000 }}>
            <AddEventForm
              newEvent={newEvent}
              setNewEvent={setNewEvent}
              onSave={handleSave}
            />
            <button onClick={handleShowForm}>닫기</button>
          </div>
        )}

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={(info) => handleAddEvent(info.dateStr)}
            eventClick={handleEventClick}
            locale='ko'
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
            }}
            buttonText={{
              prev: '이전',
              next: '다음',
              today: '오늘',
              dayGridMonth: '월별',
              timeGridWeek: '주별',
              timeGridDay: '일별',
              listMonth: '목록',
            }}
            titleFormat={{
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }}
            titleRangeSeparator=" ~ "
          />
          {showEventDetails()}
        </div>
      </div>

      <div className="chatbot-container">
        <Chatbot />
      </div>
    </div>
  );
}

export default App;
