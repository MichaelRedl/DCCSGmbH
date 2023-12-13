import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from '@microsoft/sp-webpart-base';

import * as strings from 'KukEventsWebpartWebPartStrings';
import KukEventsWebpart from './components/KukEventsWebpart';
import { IKukEventsWebpartProps } from './components/IKukEventsWebpartProps';

export interface IKukEventsWebpartWebPartProps {
  heading: string;
  headingsize: number;
  description: string;
}

export default class KukEventsWebpartWebPart extends BaseClientSideWebPart<IKukEventsWebpartWebPartProps> {

  protected onInit(): Promise<void> {
    return super.onInit().then(_ => {
      if (!this.properties.heading) {
        this.properties.heading = "Events";
      }
      if (!this.properties.headingsize) {
        this.properties.headingsize = 24;
      }
    });
  }

  public render(): void {
    const element: React.ReactElement<IKukEventsWebpartProps > = React.createElement(
      KukEventsWebpart,
      {
        description: this.properties.description,
        context: this.context,
        heading: this.properties.heading,
        headingsize: this.properties.headingsize
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  /*protected get dataVersion(): Version {
    return Version.parse('1.0');
  }*/

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
                PropertyPaneTextField('heading', {
                  label: "Überschrift", // Your custom label
                  value: this.properties.heading, // Default value if any
                //  onGetErrorMessage: this.validateNumber, // Validation (if necessary)
                  deferredValidationTime: 500, // Defers validation (useful if validation involves server-side calls)
                  //inputType: PropertyPaneTextFieldInputType.Number // Setting input type as number
                }),
                PropertyPaneSlider('headingsize', {
                  label: "Schriftgröße",
                  min: 12,
                  max: 60,
                  step: 1,
                  value: this.properties.headingsize
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
