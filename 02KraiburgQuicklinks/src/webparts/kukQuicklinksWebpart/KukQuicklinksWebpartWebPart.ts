import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from '@microsoft/sp-webpart-base';

import * as strings from 'KukQuicklinksWebpartWebPartStrings';
//import QuickLinksCustom from './components/QuicklinksCustom/QuickLinksCustom';
//import { IQuickLinksCustomProps } from './components/QuicklinksCustom/IQuickLinksCustomProps';
//import EditQuicklinks from './components/EditQuicklinks/EditQuicklinks';
import QuickLinksContainer from './components/QuickLinksContainer/QuicklinksContainer'
import styles from './components/QuickLinksCustom.module.scss';

export interface IQuickLinksCustomWebPartProps {
  description: string;
  heading: string;
  headingsize: number;
  columns: number;
  
}
export interface EditQuickLinksWebPartProps {
  description: string;
}

export default class QuickLinksCustomWebPart extends BaseClientSideWebPart<IQuickLinksCustomWebPartProps> {

  protected onInit(): Promise<void> {
    return super.onInit().then(_ => {
      if (!this.properties.columns) {
        this.properties.columns = 4;
      }
      if (!this.properties.heading) {
        this.properties.heading = "Quicklinks";
      }
      if (!this.properties.headingsize) {
        this.properties.headingsize = 24;
      }
    });
  }
 
  public render(): void {
   
    const element: React.ReactElement<{}> = React.createElement(QuickLinksContainer, {
      description: this.properties.description,
      context: this.context,
      columns: this.properties.columns,
      heading: this.properties.heading,
      headingsize: this.properties.headingsize
      
    });

    ReactDom.render(element, this.domElement);
  }

  /*protected get dataVersion(): Version {
    return Version.parse('1.0');
  }*/
  private validateNumber(value: string): string {
    // isNaN returns false if the value is an empty string, so a check is necessary
    if (value === "") {
      return "Please enter a number.";
    }
    
    // Validation to check if input is a number
    if (isNaN(Number(value))) {
      return "Input needs to be a number."; // error message that will be displayed
    }

    return ""; // no error
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            //description: strings.PropertyPaneDescription
            description: 'Einstellungen'
          },
          groups: [
            {
              //groupName: strings.BasicGroupName,
             // groupName: 'Einstellungen',colum
              groupFields: [
                /*PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),*/
                /*PropertyPaneTextField('columns', {
                  label: "Spaltenzahl", // Your custom label
                  value: this.properties.columns, // Default value if any
                  onGetErrorMessage: this.validateNumber, // Validation (if necessary)
                  deferredValidationTime: 500, // Defers validation (useful if validation involves server-side calls)
                  //inputType: PropertyPaneTextFieldInputType.Number // Setting input type as number
                })*/
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

                PropertyPaneSlider('columns', {
                  label: "Spaltenzahl",
                  min: 1,
                  max: 5,
                  step: 1,
                  value: this.properties.columns
                }),
               

              ]
            }
          ]
        }
      ]
    };
  }
}
