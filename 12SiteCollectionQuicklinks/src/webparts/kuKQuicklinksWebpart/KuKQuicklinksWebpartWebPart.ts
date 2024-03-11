import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'KuKQuicklinksWebpartWebPartStrings';
import KuKQuicklinksWebpart from './components/KuKQuicklinksWebpart';
import { IKuKQuicklinksWebpartProps } from './components/IKuKQuicklinksWebpartProps';
import QuickLinksContainer from './components/QuickLinksContainer/QuicklinksContainer';

export interface IKuKQuicklinksWebpartWebPartProps {
  description: string;
  heading: string;
  headingsize: number;
  columns: number;
}

export default class KuKQuicklinksWebpartWebPart extends BaseClientSideWebPart<IKuKQuicklinksWebpartWebPartProps> {

  public render(): void {
    alert("HUI");
    const element: React.ReactElement<{}> = React.createElement(QuickLinksContainer, {
      description: this.properties.description,
      context: this.context,
      columns: this.properties.columns,
      heading: this.properties.heading,
      headingsize: this.properties.headingsize

    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  /*protected get dataVersion(): Version {
    return Version.parse('1.0');
  }*/

  protected onInit(): Promise<void> {
    return super.onInit().then(_ => {
      if (!this.properties.columns) {
        this.properties.columns = 4;
      }
      if (!this.properties.heading) {
        this.properties.heading = 'Quicklinks';
      }
      if (!this.properties.headingsize) {
        this.properties.headingsize = 24;
      }
    });
  }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
