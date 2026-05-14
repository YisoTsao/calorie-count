// 此檔案僅在 client-side 透過 dynamic import 載入（ssr: false）
// 將 Calendar 與 withDragAndDrop HOC 組合，並注入 date-fns localizer

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // 週一開始
  getDay,
  locales: { 'zh-TW': zhTW },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DnDCalendarBase = withDragAndDrop<any>(Calendar);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CalendarDnD(props: any) {
  return <DnDCalendarBase localizer={localizer} {...props} />;
}
