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
  hoveredBoxIndex: number | undefined;
}
/* tslint:disable:no-any */
/* tslint:disable:typedef */
/* tslint:disable:no-shadowed-variable */
export default class QuickLinksCustom extends React.Component<IQuickLinksCustomProps, IQuickLinksCustomState> {
    private siteUrl: string = this.props.context.pageContext.site.absoluteUrl;   // DCCS siteUrl
  // private siteUrl: string = 'https:// xintranet.kepleruniklinikum.at/sites/landing'; // KUK siteUrl
/*  private urlParts = this.props.context.pageContext.site.absoluteUrl.split('/');
  private siteUrl = this.urlParts.slice(0, 3).join('/');*/
  constructor(props: IQuickLinksCustomProps) {
    super(props);

    this.state = {
      boxData: [],
      hoveredBoxIndex: undefined
    };
  }
  public componentDidMount(): void {
    // console.log(this.siteUrl);
    this.getCurrentUserPrincipalName();
  }
  public handleClick = (rediretionLink: string, event: React.MouseEvent<HTMLButtonElement>) => {
    window.open(rediretionLink, '_blank');
  }
  public fetchListData = async (personalLinks: string) => {
    try {
      const promises: Promise<IBoxDataObject>[] = []; //  Array to store all promises
      const url: string =
        this.siteUrl + `/_api/web/lists/GetByTitle('Quicklinks')/items?$filter=linkType eq 'mandatory'`;
      const response: any = await fetch(url, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching list data');
      }
      //  tslint:disable-next-line:no-any
      const data: any = await response.json();
      //  let optionalData: IBoxDataObject[] = [];

      if (!data.d || !data.d.results || !Array.isArray(data.d.results)) {
        throw new Error('Invalid response data structure');
      }
      //  tslint:disable-next-line:no-any
      const extractedData: IBoxDataObject[] = data.d.results.map((item: any) => ({
        boxTitle: item.Title,
        boxTitleLink: item.LinkLocation.Url,
        boxImageLink: item.imagelocationurl && item.imagelocationurl.Url ? item.imagelocationurl.Url : undefined
        //  boxTitleLink: item.LinkLocation.Url

      }));

      let personalLinksIDs: Array<string> = [];
      if (personalLinks !== ';') {
        personalLinksIDs = personalLinks.split(';');
        personalLinksIDs.pop();

        // get optional links
        for (let i: number = 0; i < personalLinksIDs.length; i++) {
          const url: string = this.siteUrl + `/_api/web/lists/GetByTitle('Quicklinks')/
          items?$filter=ID eq '${personalLinksIDs[i]}'`;
          const promise = this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1)
            .then((response: SPHttpClientResponse) => {
              return response.json();
            })
            .then((data: any) => {
              if (data.value.length > 0) {
                return {
                  boxTitle: data.value[0].Title,
                  boxTitleLink: data.value[0].LinkLocation.Url,
                  boxImageLink: data.value[0].imagelocationurl && data.value[0].
                    imagelocationurl.Url ? data.value[0].imagelocationurl.Url : undefined
                };
              } else {
                return {
                  boxTitle: '0',
                  boxTitleLink: undefined,
                  boxImageLink: undefined
                };
              }
              // optionalData.push(newOptionalLink);
            })
            .catch((error: any) => {
              console.error(error);
            });
          promises.push(promise);
        }
      }
      const optionalDataResults: IBoxDataObject[] = await Promise.all(promises);
      // console.log(optionalDataResults);
      const optionalDataResults2: IBoxDataObject[] = [];

      for (let i: number = 0; i < optionalDataResults.length; i++) {
        if (optionalDataResults[i].boxTitle !== '0') {
          optionalDataResults2.push(optionalDataResults[i]);

        }
      }
      // console.log(optionalDataResults2);

      const allLinks: Array<IBoxDataObject> = extractedData.concat(optionalDataResults2);
      this.setState({ boxData: allLinks });
    } catch (error) {
      console.log('Error:', error);
    }
  }
  public getCurrentUserPrincipalName(): void {
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
  public async getOptionalLinkIDs() {
    const endpoint = `${this.siteUrl}/_api/web/lists/GetByTitle('Quicklinks')/items?$filter=linkType eq 'optional'`;
    const optLinks = [];

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'odata-version': ''
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      for (const item of data.d.results) {
        optLinks.push(item.Id);
      }
    } catch (error) {
      console.error('Error fetching optional link IDs:', error);
    }

    return optLinks;
  }
  public async getPersonalLinksItem(userPrincipalName: string, userID: string) {
    const temp = await this.getOptionalLinkIDs();
    const optionalLinks: string = temp.join(';');
    const url: string = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/
    items?$filter=Title eq '${userPrincipalName}'`;
    this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      .then((data: any) => {
        if (data.value.length > 0) {
          this.fetchListData(data.value[0].Quicklinks);
        } else {
          // Create personal links item
          const url: string = this.siteUrl + `/_api/web/lists/getbytitle('PersonalLinks')/items`;
          const options: ISPHttpClientOptions = {
            body: JSON.stringify({
              'Title': userPrincipalName,
              'Quicklinks': optionalLinks + ';'
            }),
            headers: {
              'accept': 'application/json;odata=nometadata',
              'content-type': 'application/json;odata=nometadata',
              'odata-version': '3.0'
            }
          };
          return new Promise<boolean>((resolve, reject) => {
            this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1,
              options).then((response: SPHttpClientResponse) => {
                if (response.ok) {
                  if (response.status === 201) {

                    // Get PersonalLinks item id

                    const url: string = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/
                  items?$filter=Title eq '${userPrincipalName}'`;
                    this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1)
                      .then((response: SPHttpClientResponse) => {
                        return response.json();
                      })
                      .then((data: any) => {
                        if (data.value.length > 0) {
                          const itemID: string = data.value[0].Id;

                          // Break role inheritance
                          const url: string = `${this.siteUrl}/_api/web/lists/getbytitle('PersonalLinks')/
                        items(${itemID})/breakroleinheritance(copyRoleAssignments=false, clearSubscopes=true)`;
                          this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1);
                        }
                      })
                      .catch((error: any) => {
                        console.error(error);
                      });

                    this.fetchListData( optionalLinks + ';');
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                } else {
                  reject('Something went wrong');
                }
              }).catch((error) => {
                reject(error);
              });
          });
        }
        // return data.value && data.value.length > 0;
      })
      .catch(() => {
        //  return false;
      });
  }
  public handleMouseEnter = (index: number) => {
    this.setState({ hoveredBoxIndex: index });
  }

  public handleMouseLeave = () => {
    this.setState({ hoveredBoxIndex: undefined });
  }
  public render(): React.ReactElement<IQuickLinksCustomProps> {
    const numberColumnsString: number = this.props.columns;
    const numberColumns: number = Number(numberColumnsString);
    const boxWidth: number = 100 / numberColumns - 2;
    const boxWidthString: string = boxWidth.toString() + '%';
    //   console.log(boxWidthString);

    return (
      <div className={styles.placeholder}>
        {this.state.boxData.map((boxDataItem, index) => (

          <div
            role='none'
            className={styles.box}
            style={{
              width: boxWidthString, //  Replace '100px' with whatever width you prefer
              ...index === this.state.hoveredBoxIndex ? { borderBottom: '2px solid red' } : {}
            }}
            key={index}
            onClick={() => this.handleClick(boxDataItem.boxTitleLink, undefined)}
            onMouseEnter={() => this.handleMouseEnter(index)}
            onMouseLeave={this.handleMouseLeave}
          >

            {boxDataItem.boxImageLink ?
              <div className={styles.boxImageDiv}><img className={styles.boxImage}
                src={boxDataItem.boxImageLink} alt='Box Image' /></div> :
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
