import * as React from 'react';
import styles from '../KukEventsWebpart.module.scss';
import { InewEventsProps } from './newEventFormProps';
import { DatePicker, DayOfWeek, IDatePickerStrings, TextField, Dropdown, IDropdownOption, PrimaryButton }
    from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { sp } from '@pnp/sp';
import { times } from '@microsoft/sp-lodash-subset';

const DayPickerStrings: IDatePickerStrings = {
    months: [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ],
    shortMonths: [
        'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
        'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
    ],
    days: [
        'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'
    ],
    shortDays: [
        'S', 'M', 'D', 'M', 'D', 'F', 'S'
    ],
    goToToday: 'Heute',
    prevMonthAriaLabel: 'Vorheriger Monat',
    nextMonthAriaLabel: 'Nächster Monat',
    prevYearAriaLabel: 'Vorheriges Jahr',
    nextYearAriaLabel: 'Nächstes Jahr'
};

export interface InewEventFormState {
    title: string;
    selectedDate: Date;
    hh1: string;
    mm1: string;
    selectedDate2: Date;
    hh2: string;
    mm2: string;
    veranstalter: string;
    internerVortragende: string[];
    internerVortragendeMail: string[];
    externerVortragende: string;
    externerVortragendeMail: string[];
    Zielgruppe: string[];
    Kategorien: string[];
    Ort: string;
    OrtName: string;
    dateErrorShowing: boolean;
    ortOptions: IDropdownOption[];
}

export default class NewEventForm extends React.Component<InewEventsProps, InewEventFormState> {
    private siteUrl: string = this.props.context.pageContext.web.absoluteUrl;

    constructor(props: InewEventsProps) {
        super(props);

        this.state = {
            title: undefined,
            selectedDate: undefined,
            selectedDate2: undefined,
            hh1: undefined,
            mm1: undefined,
            hh2: undefined,
            mm2: undefined,
            veranstalter: undefined,
            internerVortragende: undefined,
            internerVortragendeMail: undefined,
            externerVortragende: undefined,
            externerVortragendeMail: undefined,
            Zielgruppe: [],
            Kategorien: [],
            Ort: undefined,
            OrtName: undefined,
            dateErrorShowing: false,
            ortOptions: []
        };
    }

    public componentDidMount(): void {
        sp.setup({
            sp: {
                baseUrl: this.props.context.pageContext.web.absoluteUrl
            }
        });
        this.getOrtOptions();
    }

    public formatDate = (date: Date): string => {
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }

    public render(): React.ReactElement<InewEventsProps> {

        return (
            <div className={styles.newEventFormContainer}>
                <div className={styles.newEventFormContainer2}>
                    <div className={styles.customFont}>
                        <div className={styles.header}>
                            <div className={styles.veranstaltungen}> Neues Event</div>
                            <div role='none' className={styles.closeButton} onClick={() =>
                                this.props.handleButtonClick()}>&times;</div>
                        </div>
                        <TextField label='Titel' value={this.state.title} onChanged={this.handleTitleChange}
                            required={true} />
                        <div className={styles.threeColumns}>
                            <DatePicker
                                label='von:'
                                value={this.state.selectedDate}
                                firstDayOfWeek={DayOfWeek.Monday}
                                strings={DayPickerStrings}
                                formatDate={this.formatDate}
                                onSelectDate={(date) => this.handleDateChange(date, 'selectedDate')}
                                isRequired={true}
                            />
                            <Dropdown
                                className={styles.nEDatePicker}
                                label='hh'
                                options={[
                                    { key: '00', text: '00' }, { key: '01', text: '01' }, { key: '02', text: '02' },
                                    { key: '03', text: '03' }, { key: '04', text: '04' }, { key: '05', text: '05' },
                                    { key: '06', text: '06' }, { key: '07', text: '07' }, { key: '08', text: '08' },
                                    { key: '09', text: '09' }, { key: '10', text: '10' }, { key: '11', text: '11' },
                                    { key: '12', text: '12' }, { key: '13', text: '13' }, { key: '14', text: '14' },
                                    { key: '15', text: '15' }, { key: '16', text: '16' }, { key: '17', text: '17' },
                                    { key: '18', text: '18' }, { key: '19', text: '19' }, { key: '20', text: '20' },
                                    { key: '21', text: '21' }, { key: '22', text: '22' }, { key: '23', text: '23' }
                                ]}
                                onChanged={(event, selectedOption) => {
                                    this.handlehh1Change(selectedOption);
                                }}
                            />
                            <div className={styles.doublePoint}>:</div>
                            <Dropdown
                                className={styles.nEDatePicker}
                                label='mm'
                                options={[
                                    { key: '00', text: '00' }, { key: '01', text: '01' }, { key: '02', text: '02' },
                                    { key: '03', text: '03' }, { key: '04', text: '04' }, { key: '05', text: '05' },
                                    { key: '06', text: '06' }, { key: '07', text: '07' }, { key: '08', text: '08' },
                                    { key: '09', text: '09' }, { key: '10', text: '10' }, { key: '11', text: '11' },
                                    { key: '12', text: '12' }, { key: '13', text: '13' }, { key: '14', text: '14' },
                                    { key: '15', text: '15' }, { key: '16', text: '16' }, { key: '17', text: '17' },
                                    { key: '18', text: '18' }, { key: '19', text: '19' }, { key: '20', text: '20' },
                                    { key: '21', text: '21' }, { key: '22', text: '22' }, { key: '23', text: '23' },
                                    { key: '24', text: '24' }, { key: '25', text: '25' }, { key: '26', text: '26' },
                                    { key: '27', text: '27' }, { key: '28', text: '28' }, { key: '29', text: '29' },
                                    { key: '30', text: '30' }, { key: '31', text: '31' }, { key: '32', text: '32' },
                                    { key: '33', text: '33' }, { key: '34', text: '34' }, { key: '35', text: '35' },
                                    { key: '36', text: '36' }, { key: '37', text: '37' }, { key: '38', text: '38' },
                                    { key: '39', text: '39' }, { key: '40', text: '40' }, { key: '41', text: '41' },
                                    { key: '42', text: '42' }, { key: '43', text: '43' }, { key: '44', text: '44' },
                                    { key: '45', text: '45' }, { key: '46', text: '46' }, { key: '47', text: '47' },
                                    { key: '48', text: '48' }, { key: '49', text: '49' }, { key: '50', text: '50' },
                                    { key: '51', text: '51' }, { key: '52', text: '52' }, { key: '53', text: '53' },
                                    { key: '54', text: '54' }, { key: '55', text: '55' }, { key: '56', text: '56' },
                                    { key: '57', text: '57' }, { key: '58', text: '58' }, { key: '59', text: '59' }

                                ]}
                                onChanged={(event, selectedOption) => {
                                    this.handlemm1Change(selectedOption);
                                }}
                            />

                        </div>
                        <div className={styles.threeColumns}>
                            <DatePicker
                                label='bis:'
                                value={this.state.selectedDate2}
                                firstDayOfWeek={DayOfWeek.Monday}
                                strings={DayPickerStrings}
                                formatDate={this.formatDate}
                                onSelectDate={(date) => this.handleDateChange(date, 'selectedDate2')}
                                isRequired={true}
                            />
                            <Dropdown
                                className={styles.nEDatePicker}
                                label='hh'
                                options={[
                                    { key: '00', text: '00' }, { key: '01', text: '01' }, { key: '02', text: '02' },
                                    { key: '03', text: '03' }, { key: '04', text: '04' }, { key: '05', text: '05' },
                                    { key: '06', text: '06' }, { key: '07', text: '07' }, { key: '08', text: '08' },
                                    { key: '09', text: '09' }, { key: '10', text: '10' }, { key: '11', text: '11' },
                                    { key: '12', text: '12' }, { key: '13', text: '13' }, { key: '14', text: '14' },
                                    { key: '15', text: '15' }, { key: '16', text: '16' }, { key: '17', text: '17' },
                                    { key: '18', text: '18' }, { key: '19', text: '19' }, { key: '20', text: '20' },
                                    { key: '21', text: '21' }, { key: '22', text: '22' }, { key: '23', text: '23' }
                                ]}
                                onChanged={(event, selectedOption) => {
                                    this.handlehh2Change(selectedOption);
                                }}
                            />
                            <div className={styles.doublePoint}>:</div>
                            <Dropdown
                                className={styles.nEDatePicker}
                                label='mm'
                                options={[
                                    { key: '00', text: '00' }, { key: '01', text: '01' }, { key: '02', text: '02' },
                                    { key: '03', text: '03' }, { key: '04', text: '04' }, { key: '05', text: '05' },
                                    { key: '06', text: '06' }, { key: '07', text: '07' }, { key: '08', text: '08' },
                                    { key: '09', text: '09' }, { key: '10', text: '10' }, { key: '11', text: '11' },
                                    { key: '12', text: '12' }, { key: '13', text: '13' }, { key: '14', text: '14' },
                                    { key: '15', text: '15' }, { key: '16', text: '16' }, { key: '17', text: '17' },
                                    { key: '18', text: '18' }, { key: '19', text: '19' }, { key: '20', text: '20' },
                                    { key: '21', text: '21' }, { key: '22', text: '22' }, { key: '23', text: '23' },
                                    { key: '24', text: '24' }, { key: '25', text: '25' }, { key: '26', text: '26' },
                                    { key: '27', text: '27' }, { key: '28', text: '28' }, { key: '29', text: '29' },
                                    { key: '30', text: '30' }, { key: '31', text: '31' }, { key: '32', text: '32' },
                                    { key: '33', text: '33' }, { key: '34', text: '34' }, { key: '35', text: '35' },
                                    { key: '36', text: '36' }, { key: '37', text: '37' }, { key: '38', text: '38' },
                                    { key: '39', text: '39' }, { key: '40', text: '40' }, { key: '41', text: '41' },
                                    { key: '42', text: '42' }, { key: '43', text: '43' }, { key: '44', text: '44' },
                                    { key: '45', text: '45' }, { key: '46', text: '46' }, { key: '47', text: '47' },
                                    { key: '48', text: '48' }, { key: '49', text: '49' }, { key: '50', text: '50' },
                                    { key: '51', text: '51' }, { key: '52', text: '52' }, { key: '53', text: '53' },
                                    { key: '54', text: '54' }, { key: '55', text: '55' }, { key: '56', text: '56' },
                                    { key: '57', text: '57' }, { key: '58', text: '58' }, { key: '59', text: '59' }

                                ]}
                                onChanged={(event, selectedOption) => {
                                    this.handlemm2Change(selectedOption);
                                }}
                            />

                        </div>
                        {this.state.dateErrorShowing && (<div className={styles.DateError}>
                            Das Enddatum darf nicht vor dem Startdatum liegen!</div>)}

                        <TextField label='Veranstalter' value={this.state.veranstalter} onChanged={this.handleVeranstalterChange} />
                        <PeoplePicker
                            context={this.props.context}
                            titleText='Interne/r Vortragende/r'
                            personSelectionLimit={10}
                            groupName={''} // Use this prop to filter by SharePoint group
                            showtooltip={true}
                            showHiddenInUI={false}
                            principleTypes={[PrincipalType.User]}
                            selectedItems={this.handleInternerVortragendeChange}
                        />
                        <PeoplePicker
                            context={this.props.context}
                            titleText='Extern/e Vortragend/e'
                            personSelectionLimit={10}
                            groupName={''} // Use this prop to filter by SharePoint group
                            showtooltip={true}
                            showHiddenInUI={false}
                            principleTypes={[PrincipalType.User]}
                            selectedItems={this.handleExternerVortragendeChange}
                        />
                        <Dropdown
                            placeHolder='Select options'
                            label='Zielgruppe'
                            multiSelect
                            options={[
                                { key: '1', text: 'Alle Ärztinnen und Ärzte' },
                                { key: '2', text: 'Basisärzte/Personen in Ausbildung zur Allgemeinmedizin' },
                                { key: '3', text: 'ÄrztInnen in Ausbildung zum Facharzt' },
                                { key: '4', text: 'Ausbildungskoordinatoren' },
                                { key: '5', text: 'Pflege' },
                                { key: '6', text: 'Verwaltung' }
                            ]}
                            onChanged={this.handleZielgruppeChange}
                        />
                        <Dropdown
                            placeHolder='Select options'
                            label='Kategorien'
                            multiSelect
                            options={[
                                { key: '1', text: 'Fortbildung' },
                                { key: '2', text: 'Social Events / Team Building' },
                                { key: '3', text: 'Veranstaltung' }
                            ]}
                            onChanged={this.handleKategorieChange}
                        />
                        <Dropdown label='Ort'
                            onChanged={this.handleOrtChange}
                            options={this.state.ortOptions} />

                        <button className={styles.saveButton} onClick={this.validateForm}
                        >Speichern</button>
                        <div className={styles.height30p}></div>
                    </div>

                </div>
            </div>
        );

    }

    private handleTitleChange = (newValue: string) => {
        this.setState({ title: newValue || '' });
    }

    private handleOrtChange = (item) => {
        this.setState({ Ort: String(item.key), OrtName: item.text });
    }
    private handleVeranstalterChange = (newValue: string) => {
        this.setState({ veranstalter: newValue || '' });
    }

    private handleDateChange = (date: Date | null | undefined, dateType: 'selectedDate' | 'selectedDate2') => {
        if (date) {
            this.setState({ [dateType]: date } as Pick<InewEventFormState, typeof dateType>);
        }
    }

    private handlehh1Change = (option: number) => {
        this.setState({ hh1: String(option) });
    }

    private handlehh2Change = (option: number) => {
        this.setState({ hh2: String(option) });
    }

    private handlemm1Change = (option: number) => {
        this.setState({ mm1: String(option) });
    }

    private handlemm2Change = (option: number) => {
        this.setState({ mm2: String(option) });
    }

    private handleZielgruppeChange = (item) => {
        let zielArray: string[] = this.state.Zielgruppe;

        if (item.selected === true) {
            zielArray.push(String(item.key));
        }
        else {
            let valueToRemove = String(item.key);
            zielArray = zielArray.filter(item => item !== valueToRemove);
        }
        this.setState({ Zielgruppe: zielArray });
    }

    private handleKategorieChange = (item) => {
        let katArray: string[] = this.state.Kategorien;

        if (item.selected === true) {
            katArray.push(String(item.key));
        }
        else {
            let valueToRemove = String(item.key);
            katArray = katArray.filter(item => item !== valueToRemove);
        }
        this.setState({ Kategorien: katArray });
    }

    private handleInternerVortragendeChange = (items) => {
        if (items && items.length > 0) {
            let mailArray: string[] = [];
            for (let i = 0; i < items.length; i++) {
                mailArray.push(items[i].secondaryText);
            }
            this.setState({ internerVortragendeMail: mailArray });
        }
    }

    private handleExternerVortragendeChange = (items) => {
        if (items && items.length > 0) {
            let mailArray: string[] = [];
            for (let i = 0; i < items.length; i++) {
                mailArray.push(items[i].secondaryText);
            }
            this.setState({ externerVortragendeMail: mailArray });
        }
    };

    private validateForm = () => {
        if (this.state.title === undefined || this.state.selectedDate === undefined || this.state.selectedDate2 === undefined
            || this.state.title === "" || this.state.hh1 === undefined || this.state.hh2 === undefined
            || this.state.mm1 === undefined || this.state.mm2 === undefined) {
            alert("Please fill in all required fields.");
            return false;
        }
        if (this.state.selectedDate2 < this.state.selectedDate) {
            this.setState({ dateErrorShowing: true });
            return false;
        }
        if (this.areSameDay(this.state.selectedDate, this.state.selectedDate2)) {
            if (Number(this.state.hh1) > Number(this.state.hh2)) {
                this.setState({ dateErrorShowing: true });
                return false;
            }
            if (Number(this.state.hh1) == Number(this.state.hh2)) {
                if (Number(this.state.mm1) > Number(this.state.mm2)) {
                    this.setState({ dateErrorShowing: true });
                    return false;
                }
            }
        }
        this.setState({ dateErrorShowing: false });
        this.saveEvent();
        return true;
    }

    private saveEvent = async () => {
        try {
            // Combine date and time for EventDate
            const eventDate: Date = this.state.selectedDate;
            eventDate.setHours(Number(this.state.hh1), Number(this.state.mm1), 0, 0);

            // Combine date and time for EndDate
            const endDate: Date = this.state.selectedDate2;
            endDate.setHours(Number(this.state.hh2), Number(this.state.mm2), 0, 0);

            // Prepare other data in JSON format
            const otherData = JSON.stringify({
                Veranstalter: this.state.veranstalter,
                InternerVortragender: this.state.internerVortragende,
                InternerVortragendeMail: this.state.internerVortragendeMail,
                ExternerVortragender: this.state.externerVortragende,
                ExternerVortragendeMail: this.state.externerVortragendeMail,
                Zielgruppe: this.state.Zielgruppe,
                Kategorien: this.state.Kategorien,
                Ort: this.state.Ort,
                OrtName: this.state.OrtName
            });

            // Save to SharePoint list
            await sp.web.lists.getByTitle("Events").items.add({
                Title: this.state.title,
                EventDate: eventDate,
                EndDate: endDate,
                EventData: otherData
            });
            this.props.componentDidMount();
            this.props.handleButtonClick();
        } catch (error) {
            console.error("Error saving event:", error);
        }
    }

    private getOrtOptions = async () => {
        try {
            const items = await sp.web.lists.getByTitle("Orte").items.select("Title").get();
            const ortOptions = items.map((item, index) => ({ key: index + 1, text: item.Title }));
            this.setState({ ortOptions });
        } catch (error) {
            console.error("Error fetching 'Orte' list items:", error);
        }
    }

    private areSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

}