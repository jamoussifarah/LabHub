import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import { reservationService } from "../Services/reservationService";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    status?: string;
    labName?: string;
    userName?: string;
    purpose?: string;
    startTime?: string;
    endTime?: string;
    createdAt?: string;
    notes?: string;
    labId?: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await reservationService.getAll();

      const formattedEvents: CalendarEvent[] = data.map((res) => ({
        id: res.id,
        title: res.lab?.name || "Lab", 
        start: res.startTime,
        end: res.endTime,
        extendedProps: {
          calendar: mapStatusToColor(res.status),
          status: res.status,
          labName: res.lab?.name,
          userName: res.user?.name,
          purpose: res.purpose,
          startTime: res.startTime,
          endTime: res.endTime,
          createdAt: res.createdAt,
          notes: res.notes,
          labId: res.labId,
        },
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Erreur chargement reservations:", error);
    }
  };

  const mapStatusToColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Warning";
      case "CONFIRMED":
        return "Success";
      case "CANCELLED":
        return "Danger";
      case "COMPLETED":
        return "Primary";
      default:
        return "Primary";
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event as unknown as CalendarEvent;

    setSelectedEvent(event);
    setEventTitle(event.title ?? "");
    setEventStartDate(event.start ? event.start.toString().split("T")[0] : "");
    setEventEndDate(event.end ? event.end.toString().split("T")[0] : "");
    setEventLevel(event.extendedProps?.calendar ?? "");

    openModal();
  };

  const handleAddOrUpdateEvent = async () => {
    try {
      if (!selectedEvent) {
        await reservationService.create({
          purpose: eventTitle,
          startTime: eventStartDate,
          endTime: eventEndDate,
          userId: "69d65069168762fb904b1a1c",
          labId: "69d65069168762fb904b1a1d",
        });

        await loadReservations();
      }

      closeModal();
      resetModalFields();
    } catch (error) {
      console.error(error);
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  const formatDateTime = (dateString?: string) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

  return (
    <>
      <PageMeta title="Calendar Dashboard" description="Reservations Calendar" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "Ajouter réservation +",
                click: openModal,
              },
            }}
          />
        </div>

        {/* MODAL */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6">
          <div className="space-y-4">

            <h2 className="text-xl font-bold">
              {selectedEvent ? "Détails de la réservation" : "Ajouter réservation"}
            </h2>

            {/* ✅ DETAILS COMPLETS */}
            {selectedEvent && (
              <div className="bg-gray-100 p-4 rounded-lg space-y-2 text-sm">
                <p><b>Lab :</b> {selectedEvent.extendedProps.labName}</p>
                <p><b>User :</b> {selectedEvent.extendedProps.userName}</p>
                <p><b>Purpose :</b> {selectedEvent.extendedProps.purpose}</p>
                <p><b>Status :</b> {selectedEvent.extendedProps.status}</p>
                <p><b>Start :</b> {formatDateTime(selectedEvent.extendedProps.startTime)}</p>
                <p><b>End :</b> {formatDateTime(selectedEvent.extendedProps.endTime)}</p>
                
                
              </div>
            )}

            {/* FORM */}
            {!selectedEvent && (
              <>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Purpose"
                  className="w-full border p-2 rounded"
                />

                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full border p-2 rounded"
                />

                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="border px-4 py-2 rounded">
                Close
              </button>

              {!selectedEvent && (
                <button
                  onClick={handleAddOrUpdateEvent}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Ajouter
                </button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

/* 🎨 EVENT DESIGN */
const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-black ${colorClass}`}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      <span className="truncate">{eventInfo.event.title}</span>
    </div>
  );
};

export default Calendar;