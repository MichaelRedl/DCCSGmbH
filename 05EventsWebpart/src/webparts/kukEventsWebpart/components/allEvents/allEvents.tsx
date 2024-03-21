import * as React from 'react';
import styles from '../KukEventsWebpart.module.scss';
import { IAllEventsProps } from './allEventsProps';
import { DatePicker, TextField, Dropdown, IDropdownOption }
    from 'office-ui-fabric-react';
import ViewEventForm from '../viewEventForm copy/viewEventForm';
import { sp } from '@pnp/sp';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';

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
    eventData: { OrtName, Veranstalter, Zielgruppe, Kategorien, Ort, InternerVortragendeMail, ExternerVortragendeMail };
}

export interface IAllEventsState {
    eventsData: IEventsObject[];
    hoveredEventIndex: number | undefined;
    selectedDate: Date | undefined;
    selectedDate2: Date | undefined;
    selectedDateString: string | undefined;
    selectedDate2String: string | undefined;
    showViewEventForm: boolean;
    formItemId: string;
    ortOptions: IDropdownOption[];
    veranstalter: string;
    zielgruppe: string[];
    Kategorien: string[];
    Ort: string;
    internalPresentersEmails: string[];
    externalPresentersEmails: string[];
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
            formItemId: undefined,
            ortOptions: undefined,
            veranstalter: undefined,
            zielgruppe: [],
            Kategorien: [],
            Ort: undefined,
            internalPresentersEmails: [],
            externalPresentersEmails: [],
        };
    }

    public getEvents = async (from: any, until: any, veranstalter: any, zielgruppe: any,
        katArray: any, location: any, internalPresentersEmails: any, externalPresentersEmails: any) => {
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

            let eventsItems: IEventsObject[] = data.d.results.map((item: any) => ({
                title: item.Title,
                startTime: item.EventDate,
                endTime: item.EndDate,
                location: item.Location,
                category: item.Category,
                id: item.Id,
                eventData: JSON.parse(item.EventData) || {
                    OrtName: undefined, Veranstalter: undefined,
                    Zielgruppe: undefined, Ort: undefined, InternerVortragendeMail: undefined, ExternerVortragendeMail: undefined
                }
                /* day: '13',
                 month: 'August'*/

            }));

            // Filter based on 'veranstalter', 'zielgruppe', 'kategorie' and 'ort'
            if (veranstalter) {
                eventsItems = eventsItems.filter(item => item.eventData.Veranstalter &&
                    item.eventData.Veranstalter.includes(veranstalter));
            }
            if (zielgruppe && !zielgruppe.includes('7')) {
                for (let i = 0; i < zielgruppe.length; i++) {
                    eventsItems = eventsItems.filter(item => item.eventData.Zielgruppe &&
                        item.eventData.Zielgruppe.includes(zielgruppe[i]));
                }
            }
            if (katArray && !katArray.includes('4')) {
                for (let i = 0; i < katArray.length; i++) {
                    eventsItems = eventsItems.filter(item => item.eventData.Kategorien &&
                        item.eventData.Kategorien.includes(katArray[i]));
                }
            }
            if (location && Number(location) !== this.state.ortOptions.length) {
                eventsItems = eventsItems.filter(item => item.eventData.Ort &&
                    item.eventData.Ort.includes(location));
            }

            if (this.state.internalPresentersEmails.length > 0) {
                eventsItems = eventsItems.filter(item => {
                    let matchFound = false;
                    for (let email of this.state.internalPresentersEmails) {
                        if (item.eventData.InternerVortragendeMail &&
                            item.eventData.InternerVortragendeMail.includes(email)) {
                            matchFound = true;
                            break; // Stop searching if a match is found
                        }
                    }
                    return matchFound;
                });
            }

            if (this.state.externalPresentersEmails.length > 0) {
                eventsItems = eventsItems.filter(item => {
                    let matchFound = false;
                    for (let email of this.state.externalPresentersEmails) {
                        if (item.eventData.ExternerVortragendeMail &&
                            item.eventData.ExternerVortragendeMail.includes(email)) {
                            matchFound = true;
                            break; // Stop searching if a match is found
                        }
                    }
                    return matchFound;
                });
            }
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
        /*this.setState({ eventsData: [],
            hoveredEventIndex: undefined,
            selectedDate: undefined,
            selectedDate2: undefined,
            selectedDateString: undefined,
            selectedDate2String: undefined,
            ortOptions: undefined,
            veranstalter: undefined,
            zielgruppe: [],
            Kategorien: [],
            Ort: undefined,
            internalPresentersEmails: [],
            externalPresentersEmails: []});*/

        this.getEvents(this.state.selectedDateString, this.state.selectedDate2String,
            this.state.veranstalter, this.state.zielgruppe, this.state.Kategorien,
            this.state.Ort, this.state.internalPresentersEmails, this.state.externalPresentersEmails);
        //this.getEvents(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        this.getOrtOptions();
    }

    public handleClick(id: string): void {
        const url: string = this.siteUrl + '/Lists/Events/DispForm.aspx?ID=' + id;
        window.open(url, 'blank');
    }

    public handleClick4(id: string): void {
        this.setState({ showViewEventForm: !this.state.showViewEventForm });
        this.setState({ formItemId: id });
    }

    public handleDateChange = (date: Date | undefined | undefined): void => {
        const dateString: string = date.toISOString();
        if (date) { this.setState({ selectedDate: date, selectedDateString: dateString }); }
        this.getEvents(dateString, this.state.selectedDate2String,
            this.state.veranstalter, this.state.zielgruppe, this.state.Kategorien,
            this.state.Ort, this.state.internalPresentersEmails, this.state.externalPresentersEmails);
    }

    public handleDateChange2 = (date: Date | undefined | undefined): void => {
        let dateString: string = date.toISOString();
        const temp: Date = new Date(dateString);
        temp.setDate(temp.getDate() + 1);
        dateString = temp.toISOString();
        if (date) { this.setState({ selectedDate2: date, selectedDate2String: dateString }); }
        this.getEvents(this.state.selectedDateString, dateString, this.state.veranstalter,
            this.state.zielgruppe, this.state.Kategorien, this.state.Ort,
            this.state.internalPresentersEmails, this.state.externalPresentersEmails);
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
                            <div className={styles.certainWidth}>von: <DatePicker
                                value={this.state.selectedDate}
                                onSelectDate={this.handleDateChange}
                            /></div>
                            <div className={styles.certainWidth}>bis: <DatePicker
                                value={this.state.selectedDate2}
                                onSelectDate={this.handleDateChange2}
                            /></div>

                        </div>
                        <div className={styles.dateCointainer}>
                            <div className={styles.certainWidth2}><Dropdown
                                placeHolder='Select options'
                                label='Zielgruppe'
                                multiSelect
                                options={[
                                    { key: '7', text: 'Alle' },
                                    { key: '1', text: 'Alle Ärztinnen und Ärzte' },
                                    { key: '2', text: 'Basisärzte/Personen in Ausbildung zur Allgemeinmedizin' },
                                    { key: '3', text: 'ÄrztInnen in Ausbildung zum Facharzt' },
                                    { key: '4', text: 'Ausbildungskoordinatoren' },
                                    { key: '5', text: 'Pflege' },
                                    { key: '6', text: 'Verwaltung' }

                                ]}
                                onChanged={this.handleZielgruppeChange}
                            /* onChanged={this.handleZielgruppeChange}
                             {...(this.state.firstLoad ? { selectedKeys: this.state.Zielgruppe } : {})}
                             disabled={!this.state.isEditMode}*/
                            /></div>
                            <div className={styles.certainWidth2}><TextField
                                label='Veranstalter'
                                onChanged={this.handleVeranstalterChange}
                                /*value={this.state.veranstalter} onChanged={this.handleVeranstalterChange}
                            disabled={!this.state.isEditMode} *//>

                            </div>
                        </div>
                        <div className={styles.dateCointainer}>
                            <div className={styles.certainWidth2}><Dropdown
                                placeHolder='Select options'
                                label='Kategorien'
                                multiSelect
                                options={[
                                    { key: '4', text: 'Alle' },
                                    { key: '1', text: 'Fortbildung' },
                                    { key: '2', text: 'Social Events / Team Building' },
                                    { key: '3', text: 'Veranstaltung' }
                                ]}
                                onChanged={this.handleKategorieChange}
                            /* onChanged={this.handleKategorieChange}
                             {...(this.state.firstLoad ? { selectedKeys: this.state.Kategorien } : {})}
                             disabled={!this.state.isEditMode}*/
                            />
                            </div>
                            <div className={styles.certainWidth2}>
                                <Dropdown label='Ort'
                                    options={this.state.ortOptions}
                                    onChanged={this.handleOrtChange}
                                /*  onChanged={this.handleOrtChange}
                                  disabled={!this.state.isEditMode}
                                  options={this.state.ortOptions}
                                  {...(this.state.firstLoad ? { selectedKey: Number(this.state.Ort) } : {})}*/
                                />
                            </div>
                        </div>
                        <div className={styles.dateCointainer}>
                            <div className={styles.certainWidth2}>
                                <PeoplePicker
                                    context={this.props.context}
                                    titleText='Interne/r Vortragende/r'
                                    personSelectionLimit={10}
                                    groupName={''} // Use this prop to filter by SharePoint group
                                    showtooltip={true}
                                    showHiddenInUI={false}
                                    principleTypes={[PrincipalType.User]}
                                    selectedItems={this.handleInternalPresenterChange}
                                />
                            </div>
                            <div className={styles.certainWidth2}>
                                <PeoplePicker
                                    context={this.props.context}
                                    titleText='Extern/e Vortragend/e'
                                    personSelectionLimit={10}
                                    groupName={''} // Use this prop to filter by SharePoint group
                                    showtooltip={true}
                                    showHiddenInUI={false}
                                    principleTypes={[PrincipalType.User]}
                                    selectedItems={this.handleExternalPresenterChange}
                                />
                            </div>

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
                                        {eventsItem.eventData.OrtName && eventsItem.eventData.OrtName !== 'undefined' &&
                                            eventsItem.eventData.OrtName !== 'null' &&
                                            (<img alt='altname' className={styles.icon} src={locationIcon}></img>)}
                                        {eventsItem.eventData.OrtName && eventsItem.eventData.OrtName !== 'undefined' &&
                                            eventsItem.eventData.OrtName !== 'null' &&
                                            (<div className={styles.location}>{eventsItem.eventData.OrtName}</div>)}
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
                {
                    this.state.showViewEventForm && (
                        <div>
                            <ViewEventForm componentDidMount={() => this.componentDidMount()}
                                description={this.props.description} context={this.props.context}
                                handleButtonClick={() => this.handleClick4(undefined)}
                                formItemId={this.state.formItemId}></ViewEventForm>
                        </div>
                    )
                }
            </div >
        );
    }
    private getOrtOptions = async () => {
        try {
            const items = await sp.web.lists.getByTitle('Orte').items.select('Title').get();
            let ortOptions = items.map((item, index) => ({ key: index + 1, text: item.Title }));
            let allKey = ortOptions.length + 1;
            ortOptions.unshift({ key: allKey, text: 'Alle' });
            this.setState({ ortOptions });

        } catch (error) {
            console.error('Error fetching Orte list items:', error);
        }
    }

    private handleZielgruppeChange = (item) => {
        let zielArray: string[] = this.state.zielgruppe;

        if (item.selected === true) {
            let tempItemKey = String(item.key);
            zielArray.push(tempItemKey);
        } else {
            let valueToRemove = String(item.key);
            zielArray = zielArray.filter(item => item !== valueToRemove);
        }
        this.setState({ zielgruppe: zielArray });
        this.getEvents(this.state.selectedDateString, this.state.selectedDate2String,
            this.state.veranstalter, zielArray, this.state.Kategorien, this.state.Ort,
            this.state.internalPresentersEmails, this.state.externalPresentersEmails);
    }

    private handleVeranstalterChange = (event: string) => {
        this.setState({ veranstalter: event || '' });
        this.getEvents(this.state.selectedDateString, this.state.selectedDate2String,
            event, this.state.zielgruppe, this.state.Kategorien, this.state.Ort,
            this.state.internalPresentersEmails, this.state.externalPresentersEmails);
    }

    private handleKategorieChange = (item) => {
        let katArray: string[] = this.state.Kategorien;

        if (item.selected === true) {
            katArray.push(String(item.key));
        } else {
            let valueToRemove = String(item.key);
            katArray = katArray.filter(item => item !== valueToRemove);
        }
        this.setState({ Kategorien: katArray });
        this.getEvents(this.state.selectedDateString, this.state.selectedDate2String,
            this.state.veranstalter, this.state.zielgruppe, katArray, this.state.Ort,
            this.state.internalPresentersEmails, this.state.externalPresentersEmails);
    }

    private handleOrtChange = (item) => {
        this.setState({ Ort: String(item.key) });
        this.getEvents(this.state.selectedDateString, this.state.selectedDate2String,
            this.state.veranstalter, this.state.zielgruppe, this.state.Kategorien, String(item.key),
            this.state.internalPresentersEmails, this.state.externalPresentersEmails);
    }

    private handleInternalPresenterChange = (items: any[]) => {
        const internalPresentersEmails = items.map(item => item.secondaryText);
        this.setState({ internalPresentersEmails }, () => {
            this.getEvents(this.state.selectedDateString, this.state.selectedDate2String,
                this.state.veranstalter, this.state.zielgruppe, this.state.Kategorien,
                this.state.Ort, internalPresentersEmails, this.state.externalPresentersEmails);
        });
    };

    private handleExternalPresenterChange = (items: any[]) => {
        const externalPresentersEmails = items.map(item => item.secondaryText);
        this.setState({ externalPresentersEmails }, () => {
            this.getEvents(this.state.selectedDateString, this.state.selectedDate2String,
                this.state.veranstalter, this.state.zielgruppe, this.state.Kategorien,
                this.state.Ort, this.state.internalPresentersEmails, externalPresentersEmails);
        });
    };
}