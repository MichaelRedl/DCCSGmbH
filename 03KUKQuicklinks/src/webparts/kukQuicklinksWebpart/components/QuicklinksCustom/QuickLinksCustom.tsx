import * as React from 'react';
import styles from '../QuickLinksCustom.module.scss';
import { IQuickLinksCustomProps } from './IQuickLinksCustomProps';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';

export interface IBoxDataObject {
  boxTitle: string;
  boxTitleLink: string;
  boxImageLink: string;
}

export interface IQuickLinksCustomState {
  boxData: IBoxDataObject[];
  hoveredBoxIndex: number | null;
}

export default class QuickLinksCustom extends React.Component<IQuickLinksCustomProps, IQuickLinksCustomState> {

 // private siteUrl: string = this.props.context.pageContext.web.absoluteUrl;   //DCCS siteUrl
  private siteUrl: string = 'https://xintranet.kepleruniklinikum.at/sites/Landing'; //KUK siteUrl
  // tslint:disable-next-line:no-any
  constructor(props: IQuickLinksCustomProps) {
    super(props);

    this.state = {
      boxData: [],
      hoveredBoxIndex: null
    };
  }

  public componentDidMount(): void {
    this.getCurrentUserPrincipalName();
  }

  public handleClick = (rediretionLink: string, event: React.MouseEvent<HTMLButtonElement>) => {
    window.open(rediretionLink, '_blank');
  }

  public fetchListData = async (personalLinks: string) => {
    try {
      let promises: Promise<IBoxDataObject>[] = []; // Array to store all promises
      const url: string =
        this.siteUrl + "/_api/web/lists/GetByTitle('Quicklinks')/items?$filter=linkType eq 'mandatory'";
      // this.props.context.pageContext.web.absoluteUrl+"/projects/KUKComm/_api/web/lists/GetByTitle(\'kukTestList\')/items";
      // "https://xintranet.kepleruniklinikum.at/sites/Landing/_api/Lists/getbytitle(\'Quicklinks\')/items?$filter=LinkType eq 'mandatory'";
      // tslint:disable-next-line:no-any
      const response: any = await fetch(url, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching list data');
      }
      // tslint:disable-next-line:no-any
      const data: any = await response.json();
      let optionalData: IBoxDataObject[] = [];

      if (!data.d || !data.d.results || !Array.isArray(data.d.results)) {
        throw new Error('Invalid response data structure');
      }
      // tslint:disable-next-line:no-any
      let extractedData: IBoxDataObject[] = data.d.results.map((item: any) => ({
        boxTitle: item.Title,
        boxTitleLink: item.LinkLocation.Url,
        boxImageLink: item.imagelocationurl && item.imagelocationurl.Url ? item.imagelocationurl.Url : null
        // boxTitleLink: item.LinkLocation.Url

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
                  boxImageLink: data.value[0].imagelocationurl && data.value[0].imagelocationurl.Url ? data.value[0].imagelocationurl.Url : null
                }
              }
              else {
                return {
                  boxTitle: '0',
                  boxTitleLink: null,
                  boxImageLink: null
                }
              }


              //optionalData.push(newOptionalLink);
            })
            .catch((error: any) => {
              console.error(error);
            });
          promises.push(promise);

        }


      }
      const optionalDataResults = await Promise.all(promises);
      //console.log(optionalDataResults);
      let optionalDataResults2: IBoxDataObject[] = [];

      for (let i = 0; i < optionalDataResults.length; i++) {
        if (optionalDataResults[i].boxTitle != '0') {
          optionalDataResults2.push(optionalDataResults[i]);

        }
      }
      //console.log(optionalDataResults2);

      let allLinks: Array<IBoxDataObject> = extractedData.concat(optionalDataResults2);
      this.setState({ boxData: allLinks }, () => {
      });
    } catch (error) {
      console.log('Error:', error);
    }
  }
  public getCurrentUserPrincipalName() {
    const userRequestUrl: string = `${this.siteUrl}/_api/web/currentuser`;

    this.props.context.spHttpClient.get(userRequestUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      .then((user: any) => {
        const userPrincipalName: string = user.LoginName.slice(user.LoginName.indexOf('|') + 1);
        const userID: string = user.Id;
        this.getPersonalLinksItem(userPrincipalName, userID);
      })
      .catch((error: any) => {
        console.error(error);
      });
  }
  public async getPersonalLinksItem(userPrincipalName, userID) {
    const url = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/items?$filter=Title eq '${userPrincipalName}'`;
    this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      .then((data: any) => {
        if (data.value.length > 0) {
          this.fetchListData(data.value[0].Quicklinks);
        }
        else {
          //Create personal links item
          const url: string = this.siteUrl + `/_api/web/lists/getbytitle('PersonalLinks')/items`;
          let options: ISPHttpClientOptions = {
            body: JSON.stringify({
              'Title': userPrincipalName,
              'Quicklinks': ';'


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

                  //Get PersonalLinks item id

                  const url = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/items?$filter=Title eq '${userPrincipalName}'`;
                  this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1)
                    .then((response: SPHttpClientResponse) => {
                      return response.json();
                    })
                    .then((data: any) => {
                      if (data.value.length > 0) {
                        const itemID = data.value[0].Id;

                        //Break role inheritance
                        const url = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/items(${itemID})/breakroleinheritance(copyRoleAssignments=false, clearSubscopes=true)`;
                        this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1);
                        //const roleAssignmentUrl = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/items?$filter=Title eq '${userPrincipalName}'/addroleassignment(principalid=${userID}, roledefid=1073741827)`
                        // this.props.context.spHttpClient.post(roleAssignmentUrl, SPHttpClient.configurations.v1);


                      }
                    })
                    .catch((error: any) => {
                      console.error(error);
                    });

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
  public handleMouseEnter = (index: number) => {
    this.setState({ hoveredBoxIndex: index });
  }

  public handleMouseLeave = () => {
    this.setState({ hoveredBoxIndex: null });
  }


  public render(): React.ReactElement<IQuickLinksCustomProps> {
    let numberColumnsString = this.props.columns;
    let numberColumns = Number(numberColumnsString);
    let boxWidth = 100 / numberColumns - 2;
    let boxWidthString = boxWidth.toString() + '%';
    console.log(boxWidthString);

    return (
      <div className={styles.placeholder}>
        {this.state.boxData.map((boxDataItem, index) => (

          <div
            className={styles.box}
            style={{
              width: boxWidthString, // Replace '100px' with whatever width you prefer
              ...index === this.state.hoveredBoxIndex ? { borderBottom: '2px solid red' } : {}
            }}
            key={index}
            onClick={() => this.handleClick(boxDataItem.boxTitleLink, null)}
            onMouseEnter={() => this.handleMouseEnter(index)}
            onMouseLeave={this.handleMouseLeave}
          >

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
      </div>
    );
  }
}
