import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FiActivity, FiCalendar, FiCheckCircle } from "react-icons/fi";
import useLoginUser from "../../Hooks/useLoginUser";
import useAxios from "../../Hooks/useAxios";
import Loading from "../../Root/Loading";
import NoData from "../../utils/NoData";
import TutorialModal from "../../DashboardTutorial/TutorialModal";

const locales = { "en-GB": enGB };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const StatCard = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="tk-card p-4 md:p-5">
      <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center mb-3">
        <Icon size={17} />
      </div>
      <p className="text-xs font-medium text-body-text/70 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </div>
  );
};

// Activity calendar — events come from GET /calendar-activity/:email.
const Calender = () => {
  const { currentUser } = useLoginUser();
  const axiosSecure = useAxios();

  const [events, setEvents] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (!currentUser?.email) return;
    setLoading(true);
    axiosSecure
      .get(`/calendar-activity/${currentUser.email}`)
      .then((res) => {
        setRole(res.data?.role || "");
        setEvents(
          (res.data?.events || []).map((ev) => ({
            title: ev.title,
            start: new Date(ev.start),
            end: new Date(ev.end || ev.start),
          }))
        );
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [currentUser?.email, axiosSecure]);

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((ev) => ev.start >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => a.start - b.start)
        .slice(0, 8),
    [events]
  );

  const completions = useMemo(
    () => events.filter((ev) => ev.title?.toLowerCase().includes("complet")).length,
    [events]
  );

  const activeDays = useMemo(
    () => new Set(events.map((ev) => ev.start.toDateString())).size,
    [events]
  );

  if (loading && !currentUser) return <Loading />;

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="activity-calendar"
        title="Activity calendar"
        description="All your jobs, projects and milestones on one timeline."
        listItems={[
          "Switch between month, week and day views",
          "Orange blocks are your activity events",
          "The side panel lists what is coming up next",
        ]}
      />

      {/* Calendar theming — scoped overrides for react-big-calendar */}
      <style>{`
        .tk-rbc .rbc-calendar { font-family: "Inter", sans-serif; }
        .tk-rbc .rbc-toolbar { margin-bottom: 16px; gap: 8px; flex-wrap: wrap; }
        .tk-rbc .rbc-toolbar .rbc-toolbar-label { font-weight: 600; color: #14141F; font-size: 15px; }
        .tk-rbc .rbc-toolbar button {
          border: 1px solid #E7E9EE; border-radius: 10px; color: #4B4B57;
          font-size: 13px; font-weight: 600; padding: 6px 12px; background: #fff;
        }
        .tk-rbc .rbc-toolbar button:hover { background: #FFF1E6; color: #FE6D06; border-color: #FE6D06; }
        .tk-rbc .rbc-toolbar button.rbc-active,
        .tk-rbc .rbc-toolbar button.rbc-active:hover {
          background: #FE6D06; border-color: #FE6D06; color: #fff; box-shadow: none;
        }
        .tk-rbc .rbc-month-view, .tk-rbc .rbc-time-view, .tk-rbc .rbc-agenda-view {
          border: 1px solid #E7E9EE; border-radius: 14px; overflow: hidden;
        }
        .tk-rbc .rbc-header {
          padding: 10px 6px; font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: #4B4B57; border-color: #E7E9EE; background: #F5F6F8;
        }
        .tk-rbc .rbc-month-row + .rbc-month-row, .tk-rbc .rbc-day-bg + .rbc-day-bg { border-color: #E7E9EE; }
        .tk-rbc .rbc-off-range-bg { background: #F5F6F8; }
        .tk-rbc .rbc-today { background: #FFF1E6; }
        .tk-rbc .rbc-date-cell { font-size: 12px; color: #4B4B57; padding: 6px 8px 0 0; }
        .tk-rbc .rbc-event, .tk-rbc .rbc-day-slot .rbc-background-event {
          background: #FE6D06; border: none; border-radius: 8px; font-size: 12px; padding: 2px 8px;
        }
        .tk-rbc .rbc-event.rbc-selected { background: #E55F00; }
        .tk-rbc .rbc-show-more { color: #FE6D06; font-weight: 600; font-size: 11px; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="tk-eyebrow mb-1">Activity calendar</p>
          <h1 className="tk-page-title">Your Schedule</h1>
          <p className="text-sm text-body-text/70 mt-1">
            Jobs, projects and milestones plotted over time
          </p>
        </div>
        {role && <span className="tk-badge-info self-start sm:self-auto capitalize">{role}</span>}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FiActivity} label="Total Events" value={events.length} />
        <StatCard icon={FiCalendar} label="Upcoming" value={upcoming.length} />
        <StatCard icon={FiCheckCircle} label="Completions" value={completions} />
        <StatCard icon={FiCalendar} label="Active Days" value={activeDays} />
      </div>

      {/* Calendar + upcoming panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-8 tk-card p-4 md:p-6 tk-rbc">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <span className="w-9 h-9 rounded-full border-[3px] border-primary-tint border-t-primary animate-spin" />
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              views={["month", "week", "day", "agenda"]}
              popup
              culture="en-GB"
              style={{ height: 620 }}
            />
          )}
        </div>

        {/* Upcoming events panel */}
        <div className="xl:col-span-4 tk-card overflow-hidden">
          <div className="px-5 py-4 border-b border-line-app bg-app-bg/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary-tint text-primary flex items-center justify-center">
                <FiActivity size={14} />
              </span>
              <h3 className="text-sm font-semibold text-ink">Upcoming Events</h3>
            </div>
            <span className="tk-badge-neutral">{upcoming.length}</span>
          </div>

          <div className="p-5 max-h-[560px] overflow-y-auto">
            {loading ? (
              <div className="py-10 flex items-center justify-center">
                <span className="w-7 h-7 rounded-full border-[3px] border-primary-tint border-t-primary animate-spin" />
              </div>
            ) : upcoming.length === 0 ? (
              <NoData
                title="Nothing scheduled"
                message="Upcoming jobs and project milestones will appear here."
              />
            ) : (
              <div className="space-y-3">
                {upcoming.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-app-bg/60 rounded-xl border border-line-app hover:bg-surface transition-colors"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-tint flex flex-col items-center justify-center">
                      <span className="text-[9px] font-bold text-primary leading-none uppercase">
                        {format(ev.start, "MMM")}
                      </span>
                      <span className="text-sm font-bold text-primary leading-none mt-0.5">
                        {format(ev.start, "d")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{ev.title}</p>
                      <p className="text-[11px] text-body-text/60 mt-0.5">
                        {format(ev.start, "EEE d MMM yyyy · HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calender;
