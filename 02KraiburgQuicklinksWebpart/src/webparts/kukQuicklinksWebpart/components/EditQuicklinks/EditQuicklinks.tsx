import * as React from 'react';
import styles from '../QuickLinksCustom.module.scss';
import { EditQuicklinksProps } from './EditQuicklinksProps';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';

export interface IBoxDataObject {
  boxTitle: string;
  boxTitleLink: string;
  boxImageLink: string;
  boxId: string;
  linkType: string;
}


export interface EditQuicklinksState {
  boxData: IBoxDataObject[];
  hoveredBoxIndex: number | null;
  hoveredBoxIndex2: number | null;
  boxData2: IBoxDataObject[];
}

export default class EditQuicklinks extends React.Component<EditQuicklinksProps, EditQuicklinksState> {
  //private siteUrl: string = this.props.context.pageContext.web.absoluteUrl; //DCCS SiteUrl
  private siteUrl: string = 'https://xintranet.kepleruniklinikum.at/sites/Landing'; //KUK siteUrl
  private personalLinksItemId: string = '';
  constructor(props: EditQuicklinksProps) {
    super(props);

    this.state = {
      boxData: [],
      hoveredBoxIndex: null,
      hoveredBoxIndex2: null,
      boxData2: []
    };
  }

  public componentDidMount(): void {
    this.getCurrentUserPrincipalName();

  }

  public handleClick = (boxTitle: string, boxTitleLink: string, boxImageLink: string, boxId: string, linkType: string, event: React.MouseEvent<HTMLButtonElement>) => {
    let newBoxData: IBoxDataObject[] = this.state.boxData;
    let newBoxData2 = this.state.boxData2;
    const link: IBoxDataObject = {
      boxTitle: boxTitle,
      boxTitleLink: boxTitleLink,
      boxImageLink: boxImageLink,
      boxId: boxId,
      linkType: linkType
    }

    newBoxData = newBoxData.filter(item => item.boxId !== boxId);
    newBoxData2.push(link);
    this.setState({ boxData: newBoxData, boxData2: newBoxData2 });
  }
  public handleClick2 = (boxTitle: string, boxTitleLink: string, boxImageLink: string, boxId: string, linkType: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (linkType == "mandatory") {
      alert("Mandatory links can not be removed");
      return 0;
    }

    let newBoxData: IBoxDataObject[] = this.state.boxData;
    let newBoxData2: IBoxDataObject[] = this.state.boxData2;
    const link: IBoxDataObject = {
      boxTitle: boxTitle,
      boxTitleLink: boxTitleLink,
      boxImageLink: boxImageLink,
      boxId: boxId,
      linkType: linkType
    }
    newBoxData.push(link);
    newBoxData2 = newBoxData2.filter(item => item.boxId !== boxId);
    this.setState({ boxData: newBoxData, boxData2: newBoxData2 });
  }

  public getCurrentUserPrincipalName() {
    const userRequestUrl: string = `${this.siteUrl}/_api/web/currentuser?$select=LoginName`;

    this.props.context.spHttpClient.get(userRequestUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      .then((user: any) => {
        const userPrincipalName: string = user.LoginName.slice(user.LoginName.indexOf('|') + 1);
        this.getPersonalLinksItem(userPrincipalName);
      })
      .catch((error: any) => {
        console.error(error);
      });
  }
  public handleClick3() {
    this.saveChanges();
    this.props.handleButtonClick();
  }
  public saveChanges() {
    //get optional links from state
    let personalLinks: IBoxDataObject[] = this.state.boxData2;
    let optionalPersonalLinks: string[] = [];
    let optionalPersonalLinksString: string = '';
    personalLinks.forEach(item => {
      if (item.linkType == 'optional') {
        optionalPersonalLinks.push(item.boxId);
      }
    });
    //Create personal links string
    optionalPersonalLinksString = optionalPersonalLinks.join(';');
    optionalPersonalLinksString += ';';



    //Now save optionalPersonalLinksString to PersonalLinks List
    const endpoint: string = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/items(${this.personalLinksItemId})`;
    const headers: any = {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': '',
        'IF-MATCH': '*',
        'X-HTTP-Method': 'MERGE'
    };
    const body: string = JSON.stringify({
        'Quicklinks': optionalPersonalLinksString
    });
    this.props.context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, { headers: headers, body: body })
        .then((response: SPHttpClientResponse) => {
            if (response.ok) {
            } else {

                response.json().then((responseJSON) => {
                    console.error(`Error status text: ${response.statusText}. Message: ${responseJSON.error.message.value}`);
                });
            }
        })
        .catch((error) => {
            console.error(error);
        });

  }
  public getPersonalLinksItem(userPrincipalName) {
    const url = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/items?$filter=Title eq '${userPrincipalName}'`;
    this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      .then((data: any) => {
        if (data.value.length > 0) {
          this.personalLinksItemId = data.value[0].ID;
          this.fetchListData(data.value[0].Quicklinks);
        }
        else {
          //Create personal links item
          const url: string = this.siteUrl + `/_api/web/lists/getbytitle('PersonalLinks')/items`;
          let options: ISPHttpClientOptions = {
            body: JSON.stringify({
              'Title': userPrincipalName,


            }),
            headers: {
              'accept': 'application/json;odata=nometadata',
              'content-type': 'application/json;odata=nometadata',
              'odata-version': '3.0'
            }
          };
          return new Promise<boolean>((resolve, reject) => {
            this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((response: SPHttpClientResponse) => {
              if (response.ok) {
                if (response.status == 201) {
                  this.fetchListData('');
                  resolve(true);
                }
                else {
                  resolve(false);
                }
              }
              else {
                reject('Something went wrong');
              }
            }).catch((error) => {
              reject(error);
            });
          });
        }
        //return data.value && data.value.length > 0;
      })
      .catch(() => {
        // return false;
      });
  }

  public fetchListData = async (personalLinks: string) => {
    try {
      let promises: Promise<IBoxDataObject>[] = []; // Array to store all promises
      const url: string =
        this.siteUrl + `/_api/web/lists/GetByTitle('Quicklinks')/items?$filter=linkType eq 'optional'`;
      //  'https://dev19.dccs-demo.at/projects/KUKComm/_api/web/lists/GetByTitle(\'kukTestList\')/items';
      // 'https://xintranet.kepleruniklinikum.at/sites/Landing/_api/Lists/getbytitle(\'Quicklinks\')/items';
      const response: any = await fetch(url, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching list data');
      }
      const data: any = await response.json();

      if (!data.d || !data.d.results || !Array.isArray(data.d.results)) {
        throw new Error('Invalid response data structure');
      }
      let extractedData: IBoxDataObject[] = data.d.results.map((item: any) => ({
        boxTitle: item.Title,
        boxTitleLink: item.LinkLocation.Url,
        boxImageLink: item.imagelocationurl && item.imagelocationurl.Url ? item.imagelocationurl.Url : null,
        // boxTitleLink: item.LinkLocation.Url
        boxId: item.ID,
        linkType: item.linkType
      }));

      const url2: string =
        this.siteUrl + `/_api/web/lists/GetByTitle('Quicklinks')/items?$filter=linkType eq 'mandatory'`;
      //  'https://dev19.dccs-demo.at/projects/KUKComm/_api/web/lists/GetByTitle(\'kukTestList\')/items';
      // 'https://xintranet.kepleruniklinikum.at/sites/Landing/_api/Lists/getbytitle(\'Quicklinks\')/items';
      const response2: any = await fetch(url2, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });

      if (!response2.ok) {
        throw new Error('Error fetching list data');
      }
      const data2: any = await response2.json();

      if (!data2.d || !data2.d.results || !Array.isArray(data2.d.results)) {
        throw new Error('Invalid response data structure');
      }
      const extractedData2: IBoxDataObject[] = data2.d.results.map((item: any) => ({
        boxTitle: item.Title,
        boxTitleLink: item.LinkLocation.Url,
        boxImageLink: item.imagelocationurl && item.imagelocationurl.Url ? item.imagelocationurl.Url : null,
        // boxTitleLink: item.LinkLocation.Url
        boxId: item.ID,
        linkType: item.linkType
      }));
      let personalLinksIDs: Array<string> = [];
      if (personalLinks != ';') {
        personalLinksIDs = personalLinks.split(';');
        personalLinksIDs.pop();

        //get optional links
        for (let i = 0; i < personalLinksIDs.length; i++) {
          let url: string = this.siteUrl + `/_api/web/lists/GetByTitle('Quicklinks')/items?$filter=ID eq '${personalLinksIDs[i]}'`;
          let promise = this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1)
            .then((response: SPHttpClientResponse) => {
              return response.json();
            })
            .then((data: any) => {
              if (data.value.length > 0) {
              return {
                boxTitle: data.value[0].Title,
                boxTitleLink: data.value[0].LinkLocation.Url,
                boxImageLink: data.value[0].imagelocationurl && data.value[0].imagelocationurl.Url ? data.value[0].imagelocationurl.Url : null,
                boxId: data.value[0].ID,
                linkType: data.value[0].linkType
              }
            }
            else{
              return {
                boxTitle: '0',
                boxTitleLink: null,
                boxImageLink: null,
                boxId: null,
                linkType: null
              }
            }


              //optionalData.push(newOptionalLink);
            })
            .catch((error: any) => {
              console.error(error);
            });
          promises.push(promise);
          extractedData = extractedData.filter(item => item.boxId !== promise.boxId);
        }


      }
      const optionalDataResults = await Promise.all(promises);
      let optionalDataResults2: IBoxDataObject[] = [];

      for(let i = 0; i < optionalDataResults.length; i++){
        if(optionalDataResults[i].boxTitle != '0'){
          optionalDataResults2.push(optionalDataResults[i]);
         
        }
      }
      optionalDataResults2.forEach(item => {
        extractedData = extractedData.filter(item2 => item2.boxId !== item.boxId);
      })
      let allLinks: Array<IBoxDataObject> = extractedData2.concat(optionalDataResults2);

      this.setState({ boxData: extractedData, boxData2: allLinks }, () => {
       // console.log(this.state.boxData2);
      });
    } catch (error) {
      console.log('Error:', error);
    }
  }
  public handleMouseEnter = (index: number) => {
    this.setState({ hoveredBoxIndex: index });
  }
  public handleMouseEnter2 = (index: number) => {
    this.setState({ hoveredBoxIndex2: index });
  }

  public handleMouseLeave = () => {
    this.setState({ hoveredBoxIndex: null });
  }
  public handleMouseLeave2 = () => {
    this.setState({ hoveredBoxIndex2: null });
  }

  public getMySiteUrl() {
    /* let temp: string = this.props.context.pageContext.web.absoluteUrl;
     alert(temp);*/
    const endpoint: string = this.props.context.pageContext.web.absoluteUrl + `/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=PersonalUrl`;
    this.props.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        response.json().then((data: any) => {
          let personalUrl = data.PersonalUrl;
          //  console.log(data);
          alert(personalUrl);
        });
      })


    /* return this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)
         .then((response: SPHttpClientResponse) => {
             return response.json();
         })
         .then((data: any) => {
             return data.PersonalUrl;
         });*/
  }


  public render(): React.ReactElement<EditQuicklinksProps> {

    return (
      <div className={styles.editContainer}>
        <div className={styles.editQuicklinksContainer}>
          <div className={styles.servicesVerwalten}>Services verwalten</div>
          <div><button className={styles.closeButton} onClick={this.props.handleButtonClick}>&times;</button></div>
          <div className={styles.editQuicklinksContainerBox}><div className={styles.fontsize1}>Verfügbare Links</div>
            <div className={styles.placeholder2}>

              {this.state.boxData.map((boxDataItem, index) => (

                <div className={styles.box} style={index === this.state.hoveredBoxIndex ? { borderBottom: '2px solid red' } : {}} key={index}
                onClick={() => this.handleClick(boxDataItem.boxTitle, boxDataItem.boxTitleLink, boxDataItem.boxImageLink, boxDataItem.boxId, boxDataItem.linkType, null)}
                onMouseEnter={() => this.handleMouseEnter(index)}
                onMouseLeave={this.handleMouseLeave}>

                  {boxDataItem.boxImageLink ?
                  <div className={styles.boxImageDiv}><img className={styles.boxImage} src={boxDataItem.boxImageLink} alt="Box Image" /></div> :
                  <div className={styles.boxImageDiv}></div>
                  }

                  <button
                    className={styles.boxTitleButton}>
                    <span className={styles.boxClampText}>{boxDataItem.boxTitle}</span>
                  </button>


                </div>



              ))}
            </div></div>
          <div className={styles.editQuicklinksContainerBox}><div className={styles.fontsize1}>Vorschau</div>
            <div className={styles.placeholder2}>

              {this.state.boxData2.map((boxDataItem2, index2) => (

                <div className={styles.box} style={index2 === this.state.hoveredBoxIndex2 ? { borderBottom: '2px solid red' } : {}} key={index2}
                onClick={() => this.handleClick2(boxDataItem2.boxTitle, boxDataItem2.boxTitleLink, boxDataItem2.boxImageLink, boxDataItem2.boxId, boxDataItem2.linkType, null)}
                onMouseEnter={() => this.handleMouseEnter2(index2)}
                onMouseLeave={this.handleMouseLeave2}>

                  {boxDataItem2.boxImageLink ?
                    <div className={styles.boxImageDiv}><img className={styles.boxImage} src={boxDataItem2.boxImageLink} alt="Box Image" /></div> :
                    <div className={styles.boxImageDiv}></div>
                  }

                  <button
                    className={styles.boxTitleButton}>
                    <span className={styles.boxClampText}>{boxDataItem2.boxTitle}</span>
                  </button>


                </div>



              ))}
            </div>
          </div>
          <div><button className={styles.saveButton} onClick={(event) => this.handleClick3()}>Save Changes</button></div>
        </div>




      </div>
    );
  }
}
