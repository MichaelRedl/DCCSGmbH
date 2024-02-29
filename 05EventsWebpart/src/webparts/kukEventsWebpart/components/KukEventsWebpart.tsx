import * as React from 'react';
import styles from './KukEventsWebpart.module.scss';
import { IKukEventsWebpartProps } from './IKukEventsWebpartProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import AllEvents from './allEvents/allEvents';
import NewEventForm from '../../../../lib/webparts/kukEventsWebpart/components/newEventForm/newEventForm';
import ViewEventForm from './viewEventForm copy/viewEventForm';
import { sp } from '@pnp/sp';

export interface IEventsObject {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  day: string;
  month: string;
  day2: string;
  month2: string;
  fromUntil: string;
  category: string;
  id: string;
  today: string;
  eventData: { OrtName:string };
}

export interface IEventsWebpartState {
  eventsData: IEventsObject[];
  hoveredEventIndex: number | null;
  showAllEvents: boolean;
  showNewEventForm: boolean;
  showViewEventForm: boolean;
  formItemId: string;
}

export default class KukEventsWebpart extends React.Component<IKukEventsWebpartProps, IEventsWebpartState> {

  private siteUrl: string = this.props.context.pageContext.web.absoluteUrl;

  constructor(props: IKukEventsWebpartProps) {
    super(props);

    this.state = {
      eventsData: [],
      hoveredEventIndex: undefined,
      showAllEvents: false,
      showNewEventForm: false,
      showViewEventForm: false,
      formItemId: undefined
    };
  }

  public getEvents = async () => {
    try {
      const today: Date = new Date();
      today.setHours(0, 0, 0, 0); // Set to the start of today
      const isoToday: string = today.toISOString();
      // let url: string = this.siteUrl + `/_api/web/lists/GetByTitle('Events')
      /// items?$filter=EventDate ge datetime'${isoToday}'`;
      const url: string = this.siteUrl + `/_api/web/lists/GetByTitle('Events')/
      items?$filter=EventDate ge datetime'${isoToday}'&$orderby=EventDate asc`;

      const response: Response = await fetch(url, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });
      if (!response.ok) {
        throw new Error('Error fetching list data');
      }
      const data = await response.json();

      if (!data.d || !data.d.results || !Array.isArray(data.d.results)) {
        throw new Error('Invalid response data structure');
      }

      const eventsItems: IEventsObject[] = data.d.results.map(
        (item) => ({
          title: item.Title,
          startTime: item.EventDate,
          endTime: item.EndDate,
          location: item.Location,
          category: item.Category,
          id: item.Id,
          eventData: JSON.parse(item.EventData) || { OrtName: undefined }
          /* day: '13',
           month: 'August'*/

        }));
      eventsItems.forEach(item => {
        const tempDay: Date = new Date();
        const dayTodayString: string = tempDay.getUTCDate().toString();
        const startDate: string = item.startTime;
        let date: Date = new Date(startDate);
        const originalDate: Date = new Date(startDate);
        const originalTime: string = originalDate.toISOString().substring(11, 16);
        const offsetInMilliseconds: number = date.getTimezoneOffset() * 60 * 1000;
        date = new Date(date.getTime() - offsetInMilliseconds);
        const day: number = date.getUTCDate();
        const dayString: string = day.toString();
        const month: number = date.getUTCMonth() + 1;
        let monthString: string = month.toString();
        const fromString: string = date.toISOString().substring(11, 16);

        const endDate: string = item.endTime;
        let date2: Date = new Date(endDate);
        const originalDate2: Date = new Date(endDate);
        const originalTime2: string = originalDate2.toISOString().substring(11, 16);
        const offsetInMilliseconds2: number = date2.getTimezoneOffset() * 60 * 1000;
        date2 = new Date(date2.getTime() - offsetInMilliseconds2);
        const day2: number = date2.getUTCDate();
        const day2String: string = day2.toString();
        const month2: number = date2.getUTCMonth() + 1;
        let month2String: string = month2.toString();
        const untilString: string = date2.toISOString().substring(11, 16);

        if ((dayString === day2String && monthString === month2String) ||
          (originalTime === '00:00' && originalTime2 === '23:59')) {
          if (monthString === '1') { monthString = 'Januar'; month2String = 'Januar'; }
          if (monthString === '2') { monthString = 'Februar'; month2String = 'Februar'; }
          if (monthString === '3') { monthString = 'März'; month2String = 'März'; }
          if (monthString === '4') { monthString = 'April'; month2String = 'April'; }
          if (monthString === '5') { monthString = 'Mai'; month2String = 'Mai'; }
          if (monthString === '6') { monthString = 'Juni'; month2String = 'Juni'; }
          if (monthString === '7') { monthString = 'Juli'; month2String = 'Juli'; }
          if (monthString === '8') { monthString = 'August'; month2String = 'August'; }
          if (monthString === '9') { monthString = 'September'; month2String = 'September'; }
          if (monthString === '10') { monthString = 'Oktober'; month2String = 'Oktober'; }
          if (monthString === '11') { monthString = 'November'; month2String = 'November'; }
          if (monthString === '12') { monthString = 'Dezember'; month2String = 'Dezember'; }
        } else {
          if (monthString === '1') { monthString = 'Jan.'; }
          if (monthString === '2') { monthString = 'Feb.'; }
          if (monthString === '3') { monthString = 'Mär.'; }
          if (monthString === '4') { monthString = 'Apr.'; }
          if (monthString === '5') { monthString = 'Mai'; }
          if (monthString === '6') { monthString = 'Jun.'; }
          if (monthString === '7') { monthString = 'Jul.'; }
          if (monthString === '8') { monthString = 'Aug.'; }
          if (monthString === '9') { monthString = 'Sep.'; }
          if (monthString === '10') { monthString = 'Okt.'; }
          if (monthString === '11') { monthString = 'Nov.'; }
          if (monthString === '12') { monthString = 'Dez.'; }

          if (month2String === '1') { month2String = 'Jan.'; }
          if (month2String === '2') { month2String = 'Feb.'; }
          if (month2String === '3') { month2String = 'Mär.'; }
          if (month2String === '4') { month2String = 'Apr.'; }
          if (month2String === '5') { month2String = 'Mai'; }
          if (month2String === '6') { month2String = 'Jun.'; }
          if (month2String === '7') { month2String = 'Jul.'; }
          if (month2String === '8') { month2String = 'Aug.'; }
          if (month2String === '9') { month2String = 'Sep.'; }
          if (month2String === '10') { month2String = 'Okt.'; }
          if (month2String === '11') { month2String = 'Nov.'; }
          if (month2String === '12') { month2String = 'Dez.'; }
        }

        item.day = dayString;
        item.month = monthString;
        item.day2 = day2String;
        item.month2 = month2String;
        item.today = dayTodayString;
        if (dayString === day2String && monthString === month2String) {
          item.fromUntil = fromString + ' - ' + untilString + ' Uhr';
        } else {

          if (originalTime === '00:00') {
            item.fromUntil = 'ganztägig';
          } else {
            item.fromUntil = fromString + ' Uhr';
          }

        }
      });

      const tempState: IEventsObject[] = eventsItems.slice(0, 3);

      this.setState({ eventsData: tempState });

    } catch (error) {
      console.log('Error:', error);
    }

  }
  public componentDidMount(): void {
    sp.setup({
      sp: {
        baseUrl: this.props.context.pageContext.web.absoluteUrl
      }
    });
    this.ensureOrteListExists();
    this.ensureEventDataColumnExists();
    this.getEvents();
  }

  public handleMouseEnter = (index: number) => {
    this.setState({ hoveredEventIndex: index });
  }

  public handleMouseLeave = () => {
    this.setState({ hoveredEventIndex: undefined });
  }

  public handleClick(id: string): void {
    const url: string = this.siteUrl + '/Lists/Events/DispForm.aspx?ID=' + id;
    window.open(url, 'blank');
  }

  public handleClick2(): void {
    this.setState({ showAllEvents: !this.state.showAllEvents });
  }

  public handleClick3(): void {
    this.setState({ showNewEventForm: !this.state.showNewEventForm });
  }

  public handleClick4(id: string): void {
    this.setState({ showViewEventForm: !this.state.showViewEventForm });
    this.setState({ formItemId: id });
  }

  public createCalendarFile(item: any): void {
    const {
      title,
      location,
      startTime,
      endTime
    } = item;

    const icsContent: string = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Your Company//Your App//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `LOCATION:${location}`,
      `DTSTART:${this.formatDateToICS(startTime)}`,
      `DTEND:${this.formatDateToICS(endTime)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob: Blob = new Blob([icsContent], { type: 'text/calendar' });
    const url: string = URL.createObjectURL(blob);

    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = 'event.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public formatDateToICS(dateStr: string): string {
    const date: Date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').replace('.000', '');
  }

  public render(): React.ReactElement<IKukEventsWebpartProps> {
    const clockIcon: string = require('./icons/clock.png');
    const locationIcon: string = require('./icons/location.png');
    const calendarIcon: string = require('./icons/calendarIcon.png');
    const chevronDown: string = require('./icons/chevronDown.png');
    return (
      <div className={styles.customFont}>
        <div className={styles.header}>
          <div className={styles.veranstaltungen} style={{
            fontSize:
              this.props.headingsize
          }}>{this.props.heading}</div>

          <div role='none' className={styles.alleAnzeigen} onClick={() => this.handleClick2()}><div>
            Alle anzeigen</div> <img alt='altname' className={styles.icon3} src={chevronDown}></img></div>

        </div>
        <div className={styles.header2}>
          <div role='none' className={styles.neuesEvent} onClick={() => this.handleClick3()}><div>
            + Neues Event</div></div>
        </div>
        <div className={styles.placeholder}>
          {this.state.eventsData.map((eventsItem, index) => (
            <div role='none' className={styles.event} style={index === this.state.hoveredEventIndex ?
              { borderBottom: '2px solid RGBA(230,0,0,1)' } : {}}
              onClick={() => this.handleClick4(eventsItem.id)}
              onMouseEnter={() => this.handleMouseEnter(index)}
              onMouseLeave={this.handleMouseLeave}>
              {((eventsItem.day === eventsItem.day2 && eventsItem.month === eventsItem.month2) ||
                eventsItem.fromUntil === 'ganztägig') &&
                <div className={styles.dateDiv} style={eventsItem.day === eventsItem.today ?
                  { color: 'RGBA(230,0,0,1)' } : {}}>
                  <div className={styles.day}>{eventsItem.day}</div>
                  <div className={styles.month}>{eventsItem.month}</div>
                </div>
              }
              {((eventsItem.day !== eventsItem.day2 || eventsItem.month !== eventsItem.month2) &&
                eventsItem.fromUntil !== 'ganztägig') &&
                <div className={styles.dateDiv2} style={eventsItem.day === eventsItem.today ?
                  { color: 'RGBA(230,0,0,1)' } : {}}>
                  <div className={styles.date2}>{eventsItem.day}. {eventsItem.month}</div>
                  <div className={styles.borderBottom2}></div>
                  <div className={styles.date3}>{eventsItem.day2}. {eventsItem.month2}</div>
                </div>
              }
              <div className={styles.titleDiv} style={index === this.state.hoveredEventIndex ?
                { color: 'RGBA(230,0,0,1)' } : {}}><div className={styles.category}>
                  {eventsItem.category}</div><div>{eventsItem.title}</div></div>
              <div className={styles.borderBottom}></div>
              <div className={styles.hi}>
                <img alt='altname' className={styles.icon} src={clockIcon}></img>
                <div className={styles.fromUntil}>{eventsItem.fromUntil}</div>
              </div>
              <div className={styles.locationContainer}>
                {eventsItem.eventData.OrtName && eventsItem.eventData.OrtName !== 'undefined' &&
                 (<img alt='altname' className={styles.icon} src={locationIcon}></img>)}
                {eventsItem.eventData.OrtName && eventsItem.eventData.OrtName !== 'undefined' &&
                 (<div className={styles.location}>{eventsItem.eventData.OrtName}</div>)}
              </div>

              <div className={styles.width100}>
                <div role='none' className={styles.addToCalendar} onClick={(event) => {
                  event.stopPropagation(); this.createCalendarFile(eventsItem);
                }}>
                  Zu meinem Kalender hinzufügen</div>
                <img alt='altname' className={styles.icon2} src={calendarIcon}></img>
              </div>
            </div>
          ))}
        </div>
        {this.state.showAllEvents && (
          <div>
            <AllEvents description={this.props.description} context={this.props.context}
              handleButtonClick={() => this.handleClick2()}></AllEvents>
          </div>
        )}
        {this.state.showNewEventForm && (
          <div>
            <NewEventForm componentDidMount={() => this.componentDidMount()}
             description={this.props.description} context={this.props.context}
              handleButtonClick={() => this.handleClick3()}></NewEventForm>
          </div>
        )}
        {this.state.showViewEventForm && (
          <div>
            <ViewEventForm componentDidMount={() => this.componentDidMount()}
             description={this.props.description} context={this.props.context}
              handleButtonClick={() => this.handleClick4(undefined)} formItemId={this.state.formItemId}></ViewEventForm>
          </div>
        )}
      </div>
    );
  }

  private ensureOrteListExists = async () => {
    try {
      // Check if the list exists
      await sp.web.lists.getByTitle('Orte').get();
    } catch (error) {
      // If the list does not exist, create it
      if (error instanceof Error && error.message.indexOf('404') !== -1) {
        try {
          await sp.web.lists.add('Orte', 'A list for Orte', 100, false);
        } catch (creationError) {
          console.error('Error creating the list Orte:', creationError);
        }
      } else {
        console.error('Error checking for the list Orte:', error);
      }
    }
  }

  private ensureEventDataColumnExists = async () => {
    try {
      // Attempt to get the 'EventData' field from the 'Events' list
      await sp.web.lists.getByTitle('Events').fields.getByTitle('EventData').get();
    } catch (error) {
      // Check if the error is because the field does not exist

      await sp.web.lists.getByTitle('Events').fields.addMultilineText('EventData', 6, false, false, false, false);

    }
    try {
      // Attempt to get the 'EventData' field from the 'Events' list
      await sp.web.lists.getByTitle('Events').fields.getByTitle('SeriesEventData').get();
    } catch (error) {
      // Check if the error is because the field does not exist

      await sp.web.lists.getByTitle('Events').fields.addText('SeriesEventData');

    }
  }
}
