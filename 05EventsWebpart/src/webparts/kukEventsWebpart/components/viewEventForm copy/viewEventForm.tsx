import * as React from 'react';
import styles from '../KukEventsWebpart.module.scss';
import { IviewEventsProps } from './viewEventFormProps';
import { DatePicker, DayOfWeek, IDatePickerStrings, TextField, Dropdown, IDropdownOption, PrimaryButton, Checkbox }
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

export interface IviewEventFormState {
    title: string;
    selectedDate: Date;
    hh1: string;
    mm1: string;
    selectedDate2: Date;
    hh2: string;
    mm2: string;
    beschreibung: string;
    veranstalter: string;
    internerVortragende: string;
    internerVortragendeMail: string[];
    externerVortragende: string;
    externerVortragendeMail: string[];
    Zielgruppe: string[];
    Kategorien: string[];
    Ort: string;
    OrtName: string;
    dateErrorShowing: boolean;
    isEditMode: boolean;
    ortOptions: IDropdownOption[];
    firstLoad: boolean;
    selectedRecurrence: string;
    isSeriesEvent: boolean;
    seriesEndDate: Date;
    recurrenceOptions: { key: string; text: string }[];
    seriesID: string;
    buttonsVisible: boolean;
}

export default class ViewEventForm extends React.Component<IviewEventsProps, IviewEventFormState> {
    private siteUrl: string = this.props.context.pageContext.web.absoluteUrl;

    constructor(props: IviewEventsProps) {
        super(props);

        this.state = {
            title: undefined,
            selectedDate: undefined,
            selectedDate2: undefined,
            hh1: undefined,
            mm1: undefined,
            hh2: undefined,
            mm2: undefined,
            beschreibung: undefined,
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
            isEditMode: false,
            ortOptions: [],
            firstLoad: true,
            selectedRecurrence: undefined,
            isSeriesEvent: undefined,
            seriesEndDate: undefined,
            recurrenceOptions: [
                { key: 'daily', text: 'Täglich' },
                { key: 'weekly', text: 'Wöchentlich' },
                { key: 'monthly', text: 'Monatlich' },
            ],
            seriesID: undefined,
            buttonsVisible: true
        };
    }

    public componentDidMount(): void {
        sp.setup({
            sp: {
                baseUrl: this.props.context.pageContext.web.absoluteUrl
            }
        });
        this.loadData(this.props.formItemId);
    }

    public formatDate = (date: Date): string => {
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }

    public render(): React.ReactElement<IviewEventsProps> {

        return (
            <div className={styles.newEventFormContainer}>
                <div className={styles.newEventFormContainer2}>
                    <div className={styles.customFont}>
                        <div className={styles.header}>
                            <div className={styles.veranstaltungen}> Event</div>
                            <div role='none' className={styles.closeButton} onClick={() =>
                                this.props.handleButtonClick()}>&times;</div>
                        </div>
                        <TextField label='Titel' value={this.state.title} onChanged={this.handleTitleChange}
                            required={true} disabled={!this.state.isEditMode} />
                        <div className={styles.threeColumns}>
                            <DatePicker
                                label='von:'
                                value={this.state.selectedDate}
                                firstDayOfWeek={DayOfWeek.Monday}
                                strings={DayPickerStrings}
                                formatDate={this.formatDate}
                                onSelectDate={(date) => this.handleDateChange(date, 'selectedDate')}
                                isRequired={true}
                                disabled={!this.state.isEditMode}
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
                                {...(this.state.firstLoad ? { selectedKey: this.state.hh1 } : {})}
                                disabled={!this.state.isEditMode}
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
                                {...(this.state.firstLoad ? { selectedKey: this.state.mm1 } : {})}
                                disabled={!this.state.isEditMode}
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
                                disabled={!this.state.isEditMode}
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
                                {...(this.state.firstLoad ? { selectedKey: this.state.hh2 } : {})}
                                disabled={!this.state.isEditMode}
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
                                {...(this.state.firstLoad ? { selectedKey: this.state.mm2 } : {})}
                                disabled={!this.state.isEditMode}
                            />

                        </div>
                        {this.state.dateErrorShowing && (<div className={styles.DateError}>
                            Das Enddatum darf nicht vor dem Startdatum liegen!</div>)}

                        <TextField
                            multiline
                            rows={6}
                            label='Beschreibung'
                            value={this.state.beschreibung}
                            onChanged={this.handleBeschreibungChange}
                            disabled={!this.state.isEditMode}
                        />

                        <TextField label='Veranstalter' value={this.state.veranstalter} onChanged={this.handleVeranstalterChange}
                            disabled={!this.state.isEditMode} />
                        <div style={!this.state.isEditMode ? { "pointerEvents": "none" } : {}}>
                            <PeoplePicker
                                context={this.props.context}
                                titleText='Interne/r Vortragende/r'
                                personSelectionLimit={10}
                                groupName={''} // Use this prop to filter by SharePoint group
                                showtooltip={true}
                                showHiddenInUI={false}
                                principleTypes={[PrincipalType.User]}
                                selectedItems={(items) => this.handleInternerVortragendeChange(items)}
                                defaultSelectedUsers={this.state.internerVortragendeMail}
                                disabled={!this.state.isEditMode}

                            />
                        </div>
                        <div style={!this.state.isEditMode ? { "pointerEvents": "none" } : {}}>
                            <PeoplePicker
                                context={this.props.context}
                                titleText='Extern/e Vortragend/e'
                                personSelectionLimit={10}
                                groupName={''} // Use this prop to filter by SharePoint group
                                showtooltip={true}
                                showHiddenInUI={false}
                                principleTypes={[PrincipalType.User]}
                                selectedItems={this.handleExternerVortragendeChange}
                                defaultSelectedUsers={this.state.externerVortragendeMail}
                                disabled={!this.state.isEditMode}
                            />
                        </div>
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
                            {...(this.state.firstLoad ? { selectedKeys: this.state.Zielgruppe } : {})}
                            disabled={!this.state.isEditMode}
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
                            {...(this.state.firstLoad ? { selectedKeys: this.state.Kategorien } : {})}
                            disabled={!this.state.isEditMode}
                        />
                        <Dropdown label='Ort'
                            onChanged={this.handleOrtChange}
                            disabled={!this.state.isEditMode}
                            options={this.state.ortOptions}
                            {...(this.state.firstLoad ? { selectedKey: Number(this.state.Ort) } : {})}
                        />
                        <div className={styles.height10p}></div>
                        {this.state.isSeriesEvent && (
                            <Checkbox
                                label="Serie?"
                                checked={true}
                                disabled={true}
                            />
                        )}

                        {this.state.isSeriesEvent && (
                            <div className={styles.flex2}>
                                <div>
                                    <label></label>
                                    {this.state.recurrenceOptions.map(option => (
                                        <div key={option.key}>
                                            <input
                                                type="radio"
                                                name="recurrencePattern"
                                                value={option.key}
                                                checked={this.state.selectedRecurrence === option.key}
                                                disabled={true}
                                            />
                                            {option.text}
                                        </div>
                                    ))}
                                </div>
                                <DatePicker
                                    firstDayOfWeek={DayOfWeek.Monday}
                                    strings={DayPickerStrings}
                                    formatDate={this.formatDate}
                                    label="Endet am:"
                                    value={this.state.seriesEndDate}
                                    disabled={true}
                                />
                            </div>
                        )}

                        <div className={styles.flex2}>
                            {this.state.isEditMode && !this.state.isSeriesEvent && this.state.buttonsVisible && (
                                <button className={styles.saveButton} onClick={this.validateForm}
                                >Speichern</button>)}
                            {!this.state.isEditMode && !this.state.isSeriesEvent && this.state.buttonsVisible && (
                                <button className={styles.saveButton} onClick={this.editForm}
                                >Bearbeiten</button>)}
                            {this.state.buttonsVisible && (
                                <button className={`${styles.saveButton} ${styles.marginRight}`} onClick={this.deleteEvent}
                                >Löschen</button>)}
                        </div>
                        {!this.state.buttonsVisible && (
                            <div>
                                <div className={styles.height10p}></div>
                                <div>Bitte warten Sie, bis alle Events gelöscht worden sind. Dies kann einige Sekunden dauern. Dieses Fenster schließt sich automatisch.</div>
                            </div>
                        )}
                        <div className={styles.height30p}></div>
                    </div>

                </div>
            </div>
        );

    }

    private deleteEvent = async () => {
        this.setState({ buttonsVisible: false });
        if (this.state.isSeriesEvent) {
            try {
                const itemsToDelete = await sp.web.lists.getByTitle("Events").items
                    .filter(`substringof('${this.state.seriesID}', SeriesEventData)`)
                    .get();

                for (const item of itemsToDelete) {
                    await sp.web.lists.getByTitle("Events").items.getById(item.Id).delete();
                }

                this.props.componentDidMount();
                this.props.handleButtonClick();
            } catch (error) {
                console.error("Error deleting series events: ", error);
            }
        } else {
            try {
                await sp.web.lists.getByTitle("Events").items.getById(Number(this.props.formItemId)).delete();
                this.props.componentDidMount();
                this.props.handleButtonClick();
            }
            catch (error) {
                console.error("Error deleting item: ", error);
            }
        }
    };


    private editForm = () => {
        const mode: boolean = !this.state.isEditMode;
        this.setState({ isEditMode: true, firstLoad: false });
    }

    private handleTitleChange = (newValue: string) => {
        this.setState({ title: newValue || '' }, () => {
        });
    }

    private handleOrtChange = (item) => {
        this.setState({ Ort: String(item.key), OrtName: item.text });
    }

    private handleBeschreibungChange = (event: string) => {
        this.setState({ beschreibung: event });
    };

    private handleVeranstalterChange = (event: string) => {
        this.setState({ veranstalter: event || '' });
    }

    private handleDateChange = (date: Date | null | undefined, dateType: 'selectedDate' | 'selectedDate2') => {
        if (date) {
            this.setState({ [dateType]: date } as Pick<IviewEventFormState, typeof dateType>);
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

    private handleInternerVortragendeChange(items) {
        if (items && items.length > 0) {
            let mailArray: string[] = [];
            for (let i = 0; i < items.length; i++) {
                if (mailArray.indexOf(items[i].secondaryText) === -1 && items[i].secondaryText != "") {
                    mailArray.push(items[i].secondaryText);
                }
            }
            this.setState({ internerVortragendeMail: mailArray });


        }
    }

    private handleExternerVortragendeChange = (items) => {
        if (items && items.length > 0) {
            let mailArray: string[] = [];
            for (let i = 0; i < items.length; i++) {
                if (mailArray.indexOf(items[i].secondaryText) === -1 && items[i].secondaryText != "") {
                    mailArray.push(items[i].secondaryText);
                }
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
        if (this.state.selectedDate2.getDate() < this.state.selectedDate.getDate()) {
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
            this.setState({ dateErrorShowing: false });
            this.updateEvent(Number(this.props.formItemId));
            return true;
        }
        this.updateEvent(Number(this.props.formItemId));
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

            this.props.handleButtonClick();
        } catch (error) {
            console.error("Error saving event:", error);
        }
    }

    private updateEvent = async (itemID: number) => {
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

            // Update the SharePoint list item
            await sp.web.lists.getByTitle("Events").items.getById(itemID).update({
                Title: this.state.title,
                EventDate: eventDate,
                EndDate: endDate,
                EventData: otherData,
                Description: this.state.beschreibung
            });

            this.props.componentDidMount();
            this.props.handleButtonClick();
        } catch (error) {
            console.error("Error updating event:", error);
        }
    }


    private loadData = async (itemId: string) => {
        try {
            await this.getOrtOptions();
            // Fetch the list item using its ID
            const item = await sp.web.lists.getByTitle("Events").items.getById(Number(itemId)).get();
            const title = item.Title;
            const selectedDate = new Date(item.EventDate);
            const selectedDate2 = new Date(item.EndDate);
            let hh1 = String(selectedDate.getHours());
            if (hh1.length < 2) { hh1 = 0 + hh1 }
            let mm1 = String(selectedDate.getMinutes());
            if (mm1.length < 2) { mm1 = 0 + mm1 }
            let hh2 = String(selectedDate2.getHours());
            if (hh2.length < 2) { hh2 = 0 + hh2 }
            let mm2 = String(selectedDate2.getMinutes());
            if (mm2.length < 2) { mm2 = 0 + mm2 }
            const otherData = JSON.parse(item.EventData);
            const seriesEventData = JSON.parse(item.SeriesEventData);
            this.setState({
                title,
                selectedDate,
                hh1,
                mm1,
                selectedDate2,
                hh2,
                mm2,
            });
            this.setState({ veranstalter: otherData.Veranstalter });
            this.setState({ internerVortragendeMail: otherData.InternerVortragendeMail });
            this.setState({ externerVortragendeMail: otherData.ExternerVortragendeMail });
            this.setState({ Zielgruppe: otherData.Zielgruppe });
            this.setState({ Kategorien: otherData.Kategorien });
            this.setState({ Ort: String(otherData.Ort) });
            this.setState({ OrtName: String(otherData.OrtName) });
            this.setState({ beschreibung: item.Description });
            this.setState({ selectedRecurrence: seriesEventData.selectedRecurrence || undefined });
            this.setState({ seriesEndDate: new Date(seriesEventData.seriesEndDate) || undefined });
            this.setState({ isSeriesEvent: seriesEventData.isSeriesEvent || undefined });
            this.setState({ seriesID: seriesEventData.seriesID || undefined });
            // if(otherData.eve)
        } catch (error) {
            console.error("Error loading data: ", error);
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