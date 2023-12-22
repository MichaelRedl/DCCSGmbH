import * as React from 'react';
import styles from '../KukEventsWebpart.module.scss';
import { IAllEventsProps } from './allEventsProps';
import { DatePicker } from 'office-ui-fabric-react';
import ViewEventForm from '../viewEventForm copy/viewEventForm';

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
    eventData: { OrtName };
}

export interface IAllEventsState {
    eventsData: IEventsObject[];
    hoveredEventIndex: number | null;
    selectedDate: Date | null;
    selectedDate2: Date | null;
    selectedDateString: string | null;
    selectedDate2String: string | null;
    showViewEventForm: boolean;
    formItemId: string;
}

export default class AllEvents extends React.Component<IAllEventsProps, IAllEventsState> {
    private siteUrl: string = this.props.context.pageContext.web.absoluteUrl;
    constructor(props: IAllEventsProps) {
        super(props);

        this.state = {
            eventsData: [],
            hoveredEventIndex: undefined,
            selectedDate: undefined,
            selectedDate2: undefined,
            selectedDateString: undefined,
            selectedDate2String: undefined,
            showViewEventForm: false,
            formItemId: undefined
        };
    }

    public getEvents = async (from: any, until: any) => {
        try {
            const today: Date = new Date();
            today.setHours(0, 0, 0, 0); // Set to the start of today
            const isoToday: string = today.toISOString();
            let url: string = '';
            if (from !== undefined && until === undefined) {
                url = this.siteUrl + `/_api/web/lists/GetByTitle('Events')/items?$filter=
                (EventDate ge datetime'${from}')&$orderby=EventDate asc`;
            }
            if (from !== undefined && until !== undefined) {
                url = this.siteUrl + `/_api/web/lists/GetByTitle('Events')/items?$filter=
                (EventDate ge datetime'${from}') and (EventDate le datetime'${until}')&$orderby=EventDate asc`;
            }
            if (from === undefined && until !== undefined) {
                url = this.siteUrl + `/_api/web/lists/GetByTitle('Events')/items?$filter=
                (EventDate ge datetime'${isoToday}') and (EventDate le datetime'${until}')&$orderby=EventDate asc`;
            }
            if (from === undefined && until === undefined) {
                url = this.siteUrl + `/_api/web/lists/GetByTitle('Events')/items?$filter=
                EventDate ge datetime'${isoToday}'&$orderby=EventDate asc`;
            }

            // let url: string = this.siteUrl + `/_api/web/lists/GetByTitle('Events')/
            // items?$filter=EventDate ge datetime'${isoToday}'`;
            const response = await fetch(url, {
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

            const eventsItems: IEventsObject[] = data.d.results.map((item: any) => ({
                title: item.Title,
                startTime: item.EventDate,
                endTime: item.EndDate,
                location: item.Location,
                category: item.Category,
                id: item.Id,
                eventData: JSON.parse(item.EventData) || { OrtName: null }
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

            const tempState: IEventsObject[] = eventsItems;

            this.setState({ eventsData: tempState });

        } catch (error) {
            console.log('Error:', error);
        }

    }

    public handleMouseEnter = (index: number) => {
        this.setState({ hoveredEventIndex: index });
    }

    public handleMouseLeave = () => {
        this.setState({ hoveredEventIndex: undefined });
    }

    public componentDidMount(): void {
        this.getEvents(undefined, undefined);
    }

    public handleClick(id: string): void {
        const url: string = this.siteUrl + '/Lists/Events/DispForm.aspx?ID=' + id;
        window.open(url, 'blank');
    }

    public handleClick4(id: string): void {
        this.setState({ showViewEventForm: !this.state.showViewEventForm });
        this.setState({ formItemId: id });
    }

    public handleDateChange = (date: Date | null | undefined): void => {
        const dateString: string = date.toISOString();
        if (date) { this.setState({ selectedDate: date, selectedDateString: dateString }); }
        this.getEvents(dateString, this.state.selectedDate2String);
    }

    public handleDateChange2 = (date: Date | null | undefined): void => {
        let dateString: string = date.toISOString();
        const temp: Date = new Date(dateString);
        temp.setDate(temp.getDate() + 1);
        dateString = temp.toISOString();
        if (date) { this.setState({ selectedDate2: date, selectedDate2String: dateString }); }
        this.getEvents(this.state.selectedDateString, dateString);
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

    public render(): React.ReactElement<IAllEventsProps> {
        const clockIcon: string = require('../icons/clock.png');
        const locationIcon: string = require('../icons/location.png');
        const calendarIcon: string = require('../icons/calendarIcon.png');
        //  const chevronDown: string = require('../icons/chevronDown.png');
        return (
            <div className={styles.allEventsContainer}>
                <div className={styles.allEventsContainer2}>
                    <div className={styles.customFont}>
                        <div className={styles.header}>
                            <div className={styles.veranstaltungen}> Ereignisse</div>

                            <div role='none' className={styles.closeButton} onClick={() =>
                                this.props.handleButtonClick()}>&times;</div>

                        </div>
                        <div className={styles.dateCointainer}>
                            <div className={styles.datePicker}>von: <DatePicker
                                value={this.state.selectedDate}
                                onSelectDate={this.handleDateChange}
                            /></div>
                            <div className={styles.datePicker}>bis: <DatePicker
                                value={this.state.selectedDate2}
                                onSelectDate={this.handleDateChange2}
                            /></div>
                        </div>
                        <div className={styles.placeholder2}>
                            {this.state.eventsData.map((eventsItem, index) => (
                                <div role='none' className={styles.event}
                                    style={index === this.state.hoveredEventIndex ?
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
                                    {((eventsItem.day !== eventsItem.day2 || eventsItem.month !== eventsItem.month2)
                                        && eventsItem.fromUntil !== 'ganztägig') &&
                                        <div className={styles.dateDiv2} style={eventsItem.day === eventsItem.today ?
                                            { color: 'RGBA(230,0,0,1)' } : {}}>
                                            <div className={styles.date2}>{eventsItem.day}. {eventsItem.month}</div>
                                            <div className={styles.borderBottom}></div>
                                            <div className={styles.date3}>{eventsItem.day2}. {eventsItem.month2}</div>
                                        </div>
                                    }
                                    <div className={styles.titleDiv} style={index === this.state.hoveredEventIndex ?
                                        { color: 'RGBA(230,0,0,1)' } : {}}><div className={styles.category}>
                                            {eventsItem.category}</div><div>{eventsItem.title}</div></div>
                                    <div className={styles.borderBottom}></div>
                                    <div className={styles.width100}>
                                        <img alt='alt' className={styles.icon} src={clockIcon}></img>
                                        <div className={styles.fromUntil}>{eventsItem.fromUntil}</div>
                                    </div>
                                    <div className={styles.width100}>
                                        {eventsItem.eventData.OrtName && (<img alt='altname' className={styles.icon} src={locationIcon}></img>)}
                                        {eventsItem.eventData.OrtName && (<div className={styles.location}>{eventsItem.eventData.OrtName}</div>)}
                                    </div>
                                    <div className={styles.width100}>
                                        <div role='none' className={styles.addToCalendar} onClick={(event) => {
                                            event.stopPropagation(); this.createCalendarFile(eventsItem);
                                        }}>
                                            Zu meinem Kalender hinzufügen</div>
                                        <img alt='alt' className={styles.icon2} src={calendarIcon}></img>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {this.state.showViewEventForm && (
                    <div>
                        <ViewEventForm componentDidMount={() => this.componentDidMount()} description={this.props.description} context={this.props.context}
                            handleButtonClick={() => this.handleClick4(undefined)} formItemId={this.state.formItemId}></ViewEventForm>
                    </div>
                )}
            </div>
        );
    }
}