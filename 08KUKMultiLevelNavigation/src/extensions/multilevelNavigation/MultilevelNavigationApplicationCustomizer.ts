import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { SPHttpClient, SPHttpClientCommonConfiguration, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { PageContext } from '@microsoft/sp-page-context';
import './custom.css'
/* tslint:disable: max-line-length*/
/* tslint:disable: no-consecutive-blank-lines*/
/* tslint:disable: no-any*/
/* tslint:disable: no-function-expression*/
/* tslint:disable: no-shadowed-variable*/
/* tslint:disable: no-trailing-whitespace*/
/* tslint:disable: member-ordering*/
/* tslint:disable: no-use-before-declare*/
/* tslint:disable: one-line*/
/* tslint:disable: no-unused-variable*/
/* tslint:disable: quotemark*/
/* tslint:disable: prefer-const*/
/* tslint:disable: semicolon*/
/* tslint:disable: typedef*/
/* tslint:disable:  variable-name*/
/* tslint:disable: semicolon*/

import * as strings from 'MultilevelNavigationApplicationCustomizerStrings';

const LOG_SOURCE: string = 'MultilevelNavigationApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMultilevelNavigationApplicationCustomizerProperties {
  //  This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MultilevelNavigationApplicationCustomizer
  extends BaseApplicationCustomizer<IMultilevelNavigationApplicationCustomizerProperties> {
  // Attributes
  public editDivLoading: boolean = false;
  public addButtonContextShowing: boolean = false;
  public rootSiteCollectionUrl: string = "";
  @override
  public onInit(): Promise<void> {


    /* const pathName = this.context.pageContext.site.absoluteUrl;
     const msNav = document.querySelector('.ms-nav') as HTMLElement;
 
     if (msNav) {
       //  If the URL contains '/abteilungen/', set .ms-nav to display: block, else to display: none
       if (pathName.indexOf('/abteilungen/') !== -1) {
         msNav.style.display = 'block';
       } else {
         msNav.style.display = 'none';
       }
     }
 */


    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
    }




    // Get root site collection url
    let urlParts = this.context.pageContext.site.absoluteUrl.split('/');
    this.rootSiteCollectionUrl = urlParts.slice(0, 3).join('/');


    this.checkAndModifyFeedbackDiv();

    // Create NavList if NavList does not exst yet. The links of the custom navigation will be stored in this List.
    this.checkListExists();

    //  Create div for custom navigation
    let navdiv: HTMLDivElement = document.createElement('div');
    navdiv.classList.add('navdiv');





    // Create editNavigationDiv. The user later cad edit the navigation using this div
    let editNavigationDiv: HTMLDivElement = document.createElement('div');
    editNavigationDiv.classList.add('editNavdiv');

    let editNavDivContainer: HTMLDivElement = document.createElement('div');
    editNavDivContainer.classList.add('editNavDivContainer');
    // editNavigationDiv.classList.add('clearfix');
    editNavigationDiv.classList.add('ms-Fabric');










    setTimeout(() => {
      // Render navigation
      this.renderNavdiv(navdiv);
      // Get the div with the class ms-compositeHEader-headerAndNavContainer. The custom navigation will be added to this div. 
      let div = document.querySelector('.ms-compositeHeader-headerAndNavContainer') as HTMLElement | null;
      // Append the navdiv to the div, if it exists  
      if (div) {
        div.appendChild(navdiv);
        div.appendChild(editNavigationDiv);

        // sometimes the navdiv gets attached twice so i have to remove one. I tried a lot of things but it only works this way.
        const navDivs = document.querySelectorAll('div.navdiv');
        if (navDivs.length == 2) {
          navDivs[1].remove();
        }
        const editNavDivs = document.querySelectorAll('div.editNavdiv');
        if (editNavDivs.length == 2) {
          editNavDivs[1].remove();
        }

      } else {
        let div = document.querySelector('.ms-siteHeader-siteInfo') as HTMLElement | null;
        // let div = document.querySelector('.od-TopBar-header') as HTMLElement | null;
        if (div) {
          navdiv.style.marginLeft = '2px';
          navdiv.style.position = 'absolute';
          navdiv.style.zIndex = '1';
          navdiv.style.marginTop = '52px'
          div.appendChild(navdiv);
          div.appendChild(editNavigationDiv);
        } else {
          console.error('Could not find a div');
        }
        //  console.error('Couldnt find div with class ms-HorizontalNav');
      }
    }, 1100);



    return Promise.resolve();
  }

  // View (Everything that has to do with rendering HTML)

  private checkAndModifyFeedbackDiv(): void {
    const interval = 1000; //  Interval in milliseconds (1000ms = 1 second)
    const duration = 20000; //  Duration to keep checking (20000ms = 20 seconds)
    const endTime = Date.now() + duration;

    const checkFunction = () => {
      const feedbackDiv = document.querySelector('div[class^="feedback"]') as HTMLElement;

      if (feedbackDiv) {
        const msButtonAnchor = feedbackDiv.querySelector('a[class^="ms-Button MobileUpsellView"]') as HTMLElement | null;

        if (msButtonAnchor) {

          const customButtonContainerDiv = document.createElement('div');
          customButtonContainerDiv.className = "customButtonContainer";

          if (!feedbackDiv.querySelector('.customButton')) {
            //  Add Facebook Button
            const facebookButton = document.createElement('div');
            facebookButton.className = 'customButton';
            const facebookIconUrl: string = require('./Images/Facebook.png');
            const facebookIcon = document.createElement('img');
            facebookIcon.src = facebookIconUrl;
            facebookButton.appendChild(facebookIcon);
            customButtonContainerDiv.appendChild(facebookButton);
            //  feedbackDiv.appendChild(customButtonContainerDiv);

            facebookButton.addEventListener('click', function () {
              window.open('https:// www.facebook.com/kepleruniklinikum', '_blank');
            });

            //  Add Youtube Button
            const youtubeButton = document.createElement('div');
            youtubeButton.className = 'customButton';
            const youtubeIconUrl: string = require('./Images/YouTube.png');
            const youtubeIcon = document.createElement('img');
            youtubeIcon.src = youtubeIconUrl;
            youtubeButton.appendChild(youtubeIcon);
            customButtonContainerDiv.appendChild(youtubeButton);
            //    feedbackDiv.appendChild(customButtonContainerDiv);

            youtubeButton.addEventListener('click', function () {
              window.open('https:// www.youtube.com/channel/UC78WqbBYYk8q-tYk5OPu69g', '_blank');
            });

            //  Add Instagram Button
            const instagramButton = document.createElement('div');
            instagramButton.className = 'customButton';
            const instagramIconUrl: string = require('./Images/Instagram.png');
            const instagramIcon = document.createElement('img');
            instagramIcon.src = instagramIconUrl;
            instagramButton.appendChild(instagramIcon);
            customButtonContainerDiv.appendChild(instagramButton);
            //      feedbackDiv.appendChild(instagramButton);

            instagramButton.addEventListener('click', function () {
              window.open('https:// www.instagram.com/kepleruniklinikum/', '_blank');
            });

            //  Add LinkedIn Button
            const linkedinButton = document.createElement('div');
            linkedinButton.className = 'customButton';
            const linkedinIconUrl: string = require('./Images/LinkedIn.png');
            const linkedinIcon = document.createElement('img');
            linkedinIcon.src = linkedinIconUrl;
            linkedinButton.appendChild(linkedinIcon);
            customButtonContainerDiv.appendChild(linkedinButton);
            feedbackDiv.appendChild(customButtonContainerDiv);

            linkedinButton.addEventListener('click', function () {
              window.open('https:// www.linkedin.com/company/kepleruniklinikum/', '_blank');
            });
          }

          clearInterval(intervalId);
        }
      } else if (Date.now() > endTime) {
        clearInterval(intervalId);
      }
    };
    const intervalId = setInterval(checkFunction, interval);
  }

  // This function creates and renders the edit button of the custom navigation
  public createEditButton(navdiv) {
    let editButtonDiv: HTMLDivElement = document.createElement('div');
    let link: HTMLAnchorElement = document.createElement('a');
    link.innerHTML = 'Bearbeiten';
    link.style.textDecoration = 'none';
    editButtonDiv.appendChild(link);
    editButtonDiv.classList.add('editButtonDiv');
    navdiv.appendChild(editButtonDiv);
    // OnClick() the function editNavigation is called.
    editButtonDiv.addEventListener('click', () => { if (this.editDivLoading == false) { this.editNavigation() } });
  }

  /*This function renders the custom navigation inside the navdiv. It gets the navigation links that are stored in the NavList list. */
  public renderNavdiv(navdiv) {
    navdiv.innerHTML = "";
    /*the links will get stored in the first list item of the NavList in the field "NavLinks". The field will be stored in navString.
    navString will have the following format: 
    ************************************************************************************************************************
    "Bing%=https:// bing.com%#Layer1Link1%=https:// %#Layer1Link2%=https:// %&
    %#Layer2Link1%=https:// %?Layer2Link2%=https:// %#Layer2Link3%=https:// %?Layer2Link4%=https:// %&
    %#Layer3Link1%=https:// %!Layer3Link2%=https:// %?Layer3Link3%=https:// %!Layer3Link4%=https:// %#
    Layer3Link5%=https:// %!Layer3Link6%=https:// %?Layer3Link7%=https:// %!Layer3Link8%=https:// "
    ************************************************************************************************************************
    with:
    %= as separator between link name and link
    %! as separator between layer 3 links
    %? as separator between layer 2 links
    %# as separator between layer 1 links
    %& as separator between layers
    */
    let navString: string;
    /*These arrays will contain the links for each layer. 
      layer1Links will have the format [["Layer1Link1", "https:// layer1link1.com"], ["Layer1Link2", "https:// layer1link2.com"]]
      layer2Links will have the format [[["Layer2Link1", "https:// layer2link1.com"], ["Layer2Link2", "https:// layer2link2.com"]], [["Layer2Link3", "https:// layer2link3.com"], ["Layer2Link4", "https:// layer2link4.com"]]] 
      layer3Links will have the format [[[["Layer3Link1", "https:// layer3link1.com"], ["Layer3Link2", "https:// layer3link2.com"]],
                                        [["Layer3Link3", "https:// layer3link3.com"], ["Layer3Link4", "https:// 4.com"]]],
                                        [[["Layer3Link5", "https:// layer3link5.com"], ["Layer3Link6", "https:// layer3link6.com"]],
                                        [["Layer3Link7", "https:// layer3link7.com"], ["Layer3Link8", "https:// layer3link8.com"]]]]*/
    let layer1Links = [];
    let layer2Links = [];
    let layer3Links = [];
    let tempArray = [];

    // Get navigation links from NavLinks list and store the links in the arrays
    this.getListItems().then(items => {
      navString = items[0].NavLinks;
      // navString = "Bing%=https:// bing.com%#Mapple%=https:// apple.com%&Google%=https:// google.com%?Bing%=https:// bing.com%#Der superduper längste Link, den man sich nur irgendwie vorstellen kann. Echt lange.%=https:// apple.com%&Apple%=https:// apple.com%?Apple%=https:// apple.com%!Google%=https:// google.com%#Google%=https:// google.com%!Dies ist ebenfalls ein super super langer link, es ist kaum zu glauben%=https:// %!Google Goolge Goolge Goolge Go%=https:// google.com"
      tempArray = navString.split('%&');

      // Get Layer 1 Links
      layer1Links = tempArray[0].split('%#');
      for (let i = 0; i < layer1Links.length; i++) {
        layer1Links[i] = layer1Links[i].split('%=');
      }

      // Get Layer 2 Links
      layer2Links = tempArray[1].split('%#');
      for (let i = 0; i < layer2Links.length; i++) {
        layer2Links[i] = layer2Links[i].split('%?');
        for (let n = 0; n < layer2Links[i].length; n++) {
          layer2Links[i][n] = layer2Links[i][n].split('%=');
        }
      }

      // Get Layer 3 Links
      layer3Links = tempArray[2].split('%#');
      for (let i = 0; i < layer3Links.length; i++) {
        layer3Links[i] = layer3Links[i].split('%?');
        for (let n = 0; n < layer3Links[i].length; n++) {
          layer3Links[i][n] = layer3Links[i][n].split('%!');
          for (let m = 0; m < layer3Links[i][n].length; m++) {
            layer3Links[i][n][m] = layer3Links[i][n][m].split('%=');
          }
        }

      }

      // Create layer 1 links by looping through the layer1Links array
      for (let i = 0; i < layer1Links.length; i++) {
        let navdivItem: HTMLDivElement = document.createElement('div');
        navdivItem.classList.add('navdivItem');
        let link: HTMLAnchorElement = document.createElement('a');
        link.href = layer1Links[i][1];
        link.innerHTML = layer1Links[i][0];
        link.classList.add("navdivItemLink");
        navdivItem.appendChild(link);
        // Create chevron down element
        if (layer2Links[i][0][0] !== "") {
          let chevron: HTMLSpanElement = document.createElement('span');
          chevron.classList.add('chevron');
          navdivItem.appendChild(chevron);
        }
        let navdivItemContainer: HTMLDivElement = document.createElement('div');
        navdivItemContainer.classList.add('navdivItemContainer');
        // Create layer 2 links by looping through the layer2Links array
        for (let n = 0; n < layer2Links[i].length; n++) {
          if (layer2Links[i][n][0] !== "") {
            let navDivItemChild: HTMLDivElement = document.createElement('div');
            navDivItemChild.style.display = 'none';
            navDivItemChild.classList.add('navdivItemChild')
            let link: HTMLAnchorElement = document.createElement('a');
            link.href = layer2Links[i][n][1];
            link.innerHTML = layer2Links[i][n][0];
            link.classList.add("navdivItemLink2");

            // Create chevron down element
            if (layer3Links[i][n][0][0] !== "") {
              console.log("LAYER2LINKS");
              console.log(layer3Links[i][n][0][0]);
              let chevron: HTMLSpanElement = document.createElement('span');
              chevron.classList.add('chevronBlack');
              navDivItemChild.appendChild(chevron);
            }
            navDivItemChild.appendChild(link);



            navdivItem.addEventListener('mouseenter', () => {
              let divsToHide = document.querySelectorAll('.navdivItemChild');

              for (let i = 0; i < divsToHide.length; i++) {
                let div = divsToHide[i] as HTMLElement;
                div.style.display = 'none';
              }
              let divsToHide2 = document.querySelectorAll('.navdivItemContainer2');

              for (let i = 0; i < divsToHide2.length; i++) {
                let div = divsToHide2[i] as HTMLElement;
                div.style.display = 'none';
              }

              let childDivs = navdivItem.querySelectorAll('div');
              for (let i = 0; i < childDivs.length; i++) {
                let div = childDivs[i] as HTMLElement;
                if (!div.classList.contains('navdivItemContainer2') && !div.classList.contains('navdivItemGrandChild')) {
                  div.style.display = 'block';
                }
              }

            });


            document.body.addEventListener('click', function (event) {
              if (navdivItem.contains(event.target as Node)) {
                //  do nothing, click was inside container
              } else {
                navDivItemChild.style.display = 'none';
                let divsToHide = document.querySelectorAll('.navdivItemContainer');

                for (let i = 0; i < divsToHide.length; i++) {
                  let div = divsToHide[i] as HTMLElement;
                  div.style.display = 'none';
                }
              }

            });
            // Create layer 3 links by looping through the layer3Links array
            let navdivItemContainer2: HTMLDivElement = document.createElement('div');
            navdivItemContainer2.classList.add('navdivItemContainer2');
            for (let m = 0; m < layer3Links[i][n].length; m++) {
              if (layer3Links[i][n][m][0] !== "") {
                let navDivItemGrandChild: HTMLDivElement = document.createElement('div');
                navDivItemGrandChild.style.display = 'none';
                navDivItemGrandChild.classList.add('navdivItemGrandChild')
                let link: HTMLAnchorElement = document.createElement('a');
                link.href = layer3Links[i][n][m][1];
                link.innerHTML = layer3Links[i][n][m][0];
                link.classList.add("navdivItemLink2");
                navDivItemGrandChild.appendChild(link);

                navDivItemChild.addEventListener('mouseenter', () => {
                  let childDivs = navDivItemChild.querySelectorAll('div');
                  for (let i = 0; i < childDivs.length; i++) {
                    let div = childDivs[i] as HTMLElement;
                    div.style.display = 'block';
                  }
                });

                navDivItemChild.addEventListener('mouseleave', () => {
                  let childDivs = navDivItemChild.querySelectorAll('div');
                  for (let i = 0; i < childDivs.length; i++) {
                    let div = childDivs[i] as HTMLElement;
                    div.style.display = 'none';
                  }
                });
                navdivItemContainer2.appendChild(navDivItemGrandChild)
                navDivItemChild.appendChild(navdivItemContainer2);
              }
            }
            navdivItemContainer.appendChild(navDivItemChild);
            navdivItem.appendChild(navdivItemContainer);
          }
        }

        navdiv.appendChild(navdivItem);
      }

      setTimeout(() => this.createEditButton(navdiv), 800);

    }).catch(err => {
      console.error(err);
    });
  }



  // This function renders the div to edit the navigation. This function is called when the user clicks on the "Bearbeiten" button inside the custom navigation
  public editNavigation() {
    this.editDivLoading = true;
    let body = document.querySelector('body') as HTMLElement | null;
    // MR let editDiv = document.querySelector('.editNavdiv') as HTMLElement | null;
    let editDiv = document.querySelector('.editNavdiv') as HTMLElement | null;
    editDiv.innerHTML = "";
    editDiv.style.display = 'block';
    let navString: string;
    let layer1Links = [];
    let layer2Links = [];
    let layer3Links = [];
    let tempArray = [];

    let deleteEditNavDivContainer = document.querySelector('editNavDivContainer') as HTMLDivElement | null;
    if (deleteEditNavDivContainer) {
      deleteEditNavDivContainer.remove();
    }

    let editNavDivContainer: HTMLDivElement = document.createElement('div');
    editNavDivContainer.classList.add('editNavDivContainer');
    /*
        if(!document.querySelector('editNavDivContainer')){
          let editNavDivContainer: HTMLDivElement = document.createElement('div');
          editNavDivContainer.classList.add('editNavDivContainer');
        } else {
          let editNavDivContainer = document.querySelector('editNavDivContainer') as HTMLDivElement | null;
        }
    */

    /*This is basically the same procedure as rendering the main cusom navigation. First the stored links get loaded from the NavList. Then the 
    arrays with the layer1Links, layer2Links and layer3Links get created and later rendered in the div with the class "editNavdiv"*/
    this.getListItems().then(items => {
      navString = items[0].NavLinks;
      tempArray = navString.split('%&');

      // Get layer 1 links
      layer1Links = tempArray[0].split('%#');
      for (let i = 0; i < layer1Links.length; i++) {
        layer1Links[i] = layer1Links[i].split('%=');
      }

      // Get layer 2 links
      layer2Links = tempArray[1].split('%#');
      for (let i = 0; i < layer2Links.length; i++) {
        layer2Links[i] = layer2Links[i].split('%?');
        for (let n = 0; n < layer2Links[i].length; n++) {
          layer2Links[i][n] = layer2Links[i][n].split('%=');
        }
      }

      // Get layer 3 links
      layer3Links = tempArray[2].split('%#');
      for (let i = 0; i < layer3Links.length; i++) {
        layer3Links[i] = layer3Links[i].split('%?');
        for (let n = 0; n < layer3Links[i].length; n++) {
          layer3Links[i][n] = layer3Links[i][n].split('%!');
          for (let m = 0; m < layer3Links[i][n].length; m++) {
            layer3Links[i][n][m] = layer3Links[i][n][m].split('%=');
          }
        }

      }
      /*Create layer 1 links by looping through the array layer1Links. Also create the blue add buttons to add new links. Also create context menues
      for each link (the context menu opens when clicking on the three dots).*/
      for (let i = 0; i < layer1Links.length; i++) {
        let div: HTMLDivElement = document.createElement('div');
        div.classList.add("editNavigationDiv");
        let link: HTMLDivElement = document.createElement('div');
        link.innerHTML = layer1Links[i][0];
        link.classList.add("editNavigationLink");
        // The three dots are the dots of the context menu. The context menu opens when clicking on the three dots. 
        let threeDots: HTMLDivElement = document.createElement('div');
        threeDots.innerHTML = '. . .';
        threeDots.classList.add('threeDots');
        let str: string = "" + i + '#no#no';
        this.createContextMenu(1, i, layer1Links, threeDots, str, layer1Links, layer2Links, layer3Links);
        if (layer2Links[i] == "") {
          let AddButton: HTMLDivElement = document.createElement('div');
          AddButton.innerHTML = '+';
          AddButton.classList.add('grandChildAddButton');
          this.addButtonContext(AddButton, str, layer1Links, layer2Links, layer3Links);
          AddButton.addEventListener('mouseover', () => {
            // Event listeners for the AddButton. The AttButton and the line are visible on hover and on click
            if (this.addButtonContextShowing == false) {
              AddButton.style.opacity = '1';
              lineDiv.style.opacity = '1';
            }
          });
          AddButton.addEventListener('mouseout', () => {
            if (this.addButtonContextShowing == false) {
              AddButton.style.opacity = '0';
              lineDiv.style.opacity = '0';
            }
          });
          AddButton.addEventListener('click', () => {
            if (this.addButtonContextShowing == false) {
              this.addButtonContextShowing = true;
              AddButton.style.opacity = '1';
              let childDivs = AddButton.querySelectorAll('div');
              for (let i = 0; i < childDivs.length; i++) {
                let div = childDivs[i] as HTMLElement;
                div.style.display = 'block';
              }
            }
          });

          let lineDiv: HTMLDivElement = document.createElement('div');
          lineDiv.classList.add('lineDiv');
          lineDiv.addEventListener('mouseover', () => {
            if (this.addButtonContextShowing == false) {
              AddButton.style.opacity = '1';
              lineDiv.style.opacity = '1';
            }
          });
          lineDiv.addEventListener('mouseout', () => {
            if (this.addButtonContextShowing == false) {
              AddButton.style.opacity = '0';
              lineDiv.style.opacity = '0';
            }
          });
          div.appendChild(link);
          div.appendChild(threeDots);
          div.appendChild(AddButton);
          div.appendChild(lineDiv);
        }
        else {
          div.appendChild(link);
          div.appendChild(threeDots);
        }
        editDiv.appendChild(div);


        // Create layer 2 links by looping through the array layer2Links
        for (let n = 0; n < layer2Links[i].length; n++) {
          if (layer2Links[i][n][0] !== "") {
            let childDiv: HTMLDivElement = document.createElement('div');
            childDiv.classList.add("editNavigationChildDiv");
            let link: HTMLDivElement = document.createElement('div');
            link.innerHTML = layer2Links[i][n][0];
            link.classList.add("editNavigationChildLink");
            let childThreeDots: HTMLDivElement = document.createElement('div');
            childThreeDots.innerHTML = '. . . ';
            childThreeDots.classList.add('threeDots');
            let str: string = "" + i + '#' + n + '#no';
            this.createContextMenu(2, n, layer2Links[i], childThreeDots, str, layer1Links, layer2Links, layer3Links);
            if (layer3Links[i][n] == "") {
              let ChildAddButton: HTMLDivElement = document.createElement('div');
              ChildAddButton.innerHTML = '+';
              ChildAddButton.classList.add('grandChildAddButton');
              this.addButtonContext(ChildAddButton, str, layer1Links, layer2Links, layer3Links);
              ChildAddButton.addEventListener('mouseover', () => {
                if (this.addButtonContextShowing == false) {
                  ChildAddButton.style.opacity = '1';
                  lineDiv.style.opacity = '1';
                }
              });
              ChildAddButton.addEventListener('mouseout', () => {
                if (!this.addButtonContextShowing) {
                  ChildAddButton.style.opacity = '0';
                  lineDiv.style.opacity = '0';
                }
              });
              ChildAddButton.addEventListener('click', () => {
                if (this.addButtonContextShowing == false) {
                  this.addButtonContextShowing = true;
                  ChildAddButton.style.opacity = '1';
                  let childDivs = ChildAddButton.querySelectorAll('div');
                  for (let i = 0; i < childDivs.length; i++) {
                    let div = childDivs[i] as HTMLElement;
                    div.style.display = 'block';
                  }
                }
              });

              let lineDiv: HTMLDivElement = document.createElement('div');
              lineDiv.classList.add('lineDiv');
              lineDiv.addEventListener('mouseover', () => {
                if (this.addButtonContextShowing == false) {
                  ChildAddButton.style.opacity = '1';
                  lineDiv.style.opacity = '1';
                }
              });
              lineDiv.addEventListener('mouseout', () => {
                if (this.addButtonContextShowing == false) {
                  ChildAddButton.style.opacity = '0';
                  lineDiv.style.opacity = '0';
                }
              });
              childDiv.appendChild(link);
              childDiv.appendChild(childThreeDots);
              childDiv.appendChild(ChildAddButton);
              childDiv.appendChild(lineDiv);
            }
            else {
              childDiv.appendChild(link);
              childDiv.appendChild(childThreeDots);
            }


            editDiv.appendChild(childDiv);
          }

          // Create layer 3 links by looping through the array layer3Links
          for (let m = 0; m < layer3Links[i][n].length; m++) {
            if (layer3Links[i][n][m][0] !== "") {
              let grandChildDiv: HTMLDivElement = document.createElement('div');
              grandChildDiv.classList.add("editNavigationChildDiv");
              let link: HTMLDivElement = document.createElement('div');
              link.innerHTML = layer3Links[i][n][m][0];
              link.classList.add("editNavigationGrandChildLink");
              let grandChildThreeDots: HTMLDivElement = document.createElement('div');
              grandChildThreeDots.innerHTML = '. . . ';
              grandChildThreeDots.classList.add('threeDots');
              let str: string = "" + i + '#' + n + '#' + m;
              this.createContextMenu(3, m, layer3Links[i][n], grandChildThreeDots, str, layer1Links, layer2Links, layer3Links);
              let grandChildAddButton: HTMLDivElement = document.createElement('div');
              grandChildAddButton.innerHTML = '+';
              grandChildAddButton.classList.add('grandChildAddButton');
              this.addButtonContext(grandChildAddButton, str, layer1Links, layer2Links, layer3Links);
              grandChildAddButton.addEventListener('mouseover', () => {
                if (this.addButtonContextShowing == false) {
                  grandChildAddButton.style.opacity = '1';
                  lineDiv.style.opacity = '1';
                }
              });
              grandChildAddButton.addEventListener('mouseout', () => {
                if (!this.addButtonContextShowing) {
                  grandChildAddButton.style.opacity = '0';
                  lineDiv.style.opacity = '0';
                }
              });
              grandChildAddButton.addEventListener('click', () => {
                if (this.addButtonContextShowing == false) {
                  this.addButtonContextShowing = true;
                  grandChildAddButton.style.opacity = '1';
                  let childDivs = grandChildAddButton.querySelectorAll('div');
                  for (let i = 0; i < childDivs.length; i++) {
                    let div = childDivs[i] as HTMLElement;
                    div.style.display = 'block';
                  }
                }
              });

              let lineDiv: HTMLDivElement = document.createElement('div');
              lineDiv.classList.add('lineDiv');
              lineDiv.addEventListener('mouseover', () => {
                if (this.addButtonContextShowing == false) {
                  grandChildAddButton.style.opacity = '1';
                  lineDiv.style.opacity = '1';
                }
              });
              lineDiv.addEventListener('mouseout', () => {
                if (this.addButtonContextShowing == false) {
                  grandChildAddButton.style.opacity = '0';
                  lineDiv.style.opacity = '0';
                }
              });
              grandChildDiv.appendChild(link);
              grandChildDiv.appendChild(grandChildThreeDots);
              grandChildDiv.appendChild(grandChildAddButton);
              grandChildDiv.appendChild(lineDiv);
              editDiv.appendChild(grandChildDiv);
            }
          }

        }


      }
      let doneButton: HTMLButtonElement = document.createElement('button');
      doneButton.innerHTML = 'Done';
      doneButton.classList.add('doneButton');
      doneButton.classList.add('button-4');
      doneButton.addEventListener('click', () => {
        editDiv.style.display = 'none';
        editNavDivContainer.style.display = 'none';
      });
      editDiv.appendChild(doneButton);
      editNavDivContainer.appendChild(editDiv);
      body.appendChild(editNavDivContainer);
      // body.appendChild(editDiv);
      this.editDivLoading = false;

    }).catch(err => {
      console.error(err);
      this.editDivLoading = false;
    });


  }
  // This button creates the context menu of the add button. Here the user is able to add a link name, the link itself and to save the newly created link
  public addButtonContext(addbutton, str, layer1links, layer2links, layer3links) {
    let addButtonContextDiv: HTMLDivElement = document.createElement('div');
    addButtonContextDiv.classList.add('addButtonContextDiv');
    let textDiv: HTMLDivElement = document.createElement('div');
    textDiv.innerHTML = '<h3>Add a link</h3>';
    textDiv.classList.add('addButtonContextHeader');
    let textDiv2: HTMLDivElement = document.createElement('div');
    textDiv2.innerHTML = 'Address';
    textDiv2.classList.add('addButtonContextText');
    let linkInput: HTMLTextAreaElement = document.createElement('textarea');
    linkInput.innerHTML = 'https:// ';
    linkInput.classList.add('input1');
    let textDiv3: HTMLDivElement = document.createElement('div');
    textDiv3.innerHTML = 'Display name';
    textDiv3.classList.add('addButtonContextText');
    let nameInput: HTMLInputElement = document.createElement('input');
    nameInput.type = 'text';
    nameInput.classList.add('input2');
    let saveButton: HTMLButtonElement = document.createElement('button');
    saveButton.innerHTML = 'Save';
    saveButton.classList.add('saveButton');
    saveButton.classList.add('button-4');
    let cancelButton: HTMLButtonElement = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';
    cancelButton.classList.add('cancelButton');
    cancelButton.classList.add('button-4');

    saveButton.addEventListener('click', () => {
      if (nameInput.value !== "") {
        this.createNewLink(str, nameInput.value, linkInput.value, layer1links, layer2links, layer3links)
        setTimeout(() => {
          this.addButtonContextShowing = false;
        }, 70);
      }
      else {
        alert("The Display name of the link cannot be empty");
      }

    });

    cancelButton.addEventListener('click', () => {
      this.cancelButton(addButtonContextDiv, addbutton);

      setTimeout(() => {
        this.addButtonContextShowing = false;
      }, 70);
    });

    addButtonContextDiv.appendChild(textDiv);
    addButtonContextDiv.appendChild(textDiv2);
    addButtonContextDiv.appendChild(linkInput);
    addButtonContextDiv.appendChild(textDiv3);
    addButtonContextDiv.appendChild(nameInput);
    addButtonContextDiv.appendChild(saveButton);
    addButtonContextDiv.appendChild(cancelButton);
    addbutton.appendChild(addButtonContextDiv);

  }
  public cancelButton(addButtonContextDiv, addbutton) {

    addbutton.style.opacity = '0';

    let lineDivs = document.querySelectorAll('.lineDiv');
    for (let i = 0; i < lineDivs.length; i++) {
      let div = lineDivs[i] as HTMLElement;
      div.style.opacity = '0';
    }


    let childDivs = addbutton.querySelectorAll('div');
    for (let i = 0; i < childDivs.length; i++) {
      let div = childDivs[i] as HTMLElement;
      div.style.display = 'none';
    }
  }

  /*This function creates the context menu (The one that opens when clicking on the three dots).
  Depending on the exact location of the link the context menu allows for the options to move the link up and down, 
  to promote the link or to make it a sub link and finally to remove the link*/
  public createContextMenu(layer, iteration, layerLinks, threedots, str, l1, l2, l3) {
    let temparray = str.split('#');
    let i = temparray[0];
    let n = temparray[1];
    let m = temparray[2];
    let color = 'rgb(228, 228, 228)'
    if (layer == 1) {
      let contextDiv: HTMLDivElement = document.createElement('div');
      if (iteration !== 0) {
        let moveUpButton: HTMLDivElement = document.createElement('div');
        moveUpButton.innerHTML = 'Move up';
        moveUpButton.classList.add('contextButton');
        moveUpButton.addEventListener('click', () => this.moveLinkUp(str, l1, l2, l3));
        this.grayOnHover(moveUpButton, color);
        contextDiv.appendChild(moveUpButton);
      }
      if (iteration !== layerLinks.length - 1) {
        let moveDownButton: HTMLDivElement = document.createElement('div');
        moveDownButton.innerHTML = 'Move down';
        moveDownButton.classList.add('contextButton');
        moveDownButton.addEventListener('click', () => this.moveLinkDown(str, l1, l2, l3));
        this.grayOnHover(moveDownButton, color);
        contextDiv.appendChild(moveDownButton);
      }
      if (l2[Number(i)][0][0] == "" && Number(i) !== 0) {
        let makeSubLinkButton: HTMLDivElement = document.createElement('div');
        makeSubLinkButton.innerHTML = 'Make sub link';
        this.grayOnHover(makeSubLinkButton, color);
        makeSubLinkButton.classList.add('contextButton');
        makeSubLinkButton.addEventListener('click', () => this.makeSubLink(str, l1, l2, l3));
        contextDiv.appendChild(makeSubLinkButton);
      }
      let removeButton: HTMLDivElement = document.createElement('div');
      removeButton.innerHTML = 'Remove';
      removeButton.classList.add('contextButton');
      removeButton.addEventListener('click', () => this.deleteLink(str, l1, l2, l3));
      this.grayOnHover(removeButton, color);

      contextDiv.appendChild(removeButton);
      contextDiv.classList.add('contextDiv');
      threedots.appendChild(contextDiv);
      document.body.addEventListener('click', function (event) {
        if (threedots.contains(event.target)) {
          //  do nothing, click was inside container
        } else {
          contextDiv.style.display = 'none';
        }
      });

    }
    if (layer == 2) {
      let contextDiv: HTMLDivElement = document.createElement('div');
      if (iteration !== 0) {
        let moveUpButton: HTMLDivElement = document.createElement('div');
        moveUpButton.innerHTML = 'Move up';
        moveUpButton.classList.add('contextButton');
        moveUpButton.addEventListener('click', () => this.moveLinkUp(str, l1, l2, l3));
        this.grayOnHover(moveUpButton, color);
        contextDiv.appendChild(moveUpButton);
      }
      if (iteration !== layerLinks.length - 1) {
        let moveDownButton: HTMLDivElement = document.createElement('div');
        moveDownButton.innerHTML = 'Move down';
        moveDownButton.classList.add('contextButton');
        moveDownButton.addEventListener('click', () => this.moveLinkDown(str, l1, l2, l3));
        this.grayOnHover(moveDownButton, color);
        contextDiv.appendChild(moveDownButton);
      }
      if (l3[Number(i)][Number(n)][0][0] == "" && Number(n) !== 0) {
        let makeSubLinkButton: HTMLDivElement = document.createElement('div');
        makeSubLinkButton.innerHTML = 'Make sub link';
        makeSubLinkButton.classList.add('contextButton');
        makeSubLinkButton.addEventListener('click', () => this.makeSubLink(str, l1, l2, l3));
        this.grayOnHover(makeSubLinkButton, color);
        contextDiv.appendChild(makeSubLinkButton);
      }
      let promoteSubLinkButton: HTMLDivElement = document.createElement('div');
      promoteSubLinkButton.innerHTML = 'Promote sub link';
      promoteSubLinkButton.classList.add('contextButton');
      promoteSubLinkButton.addEventListener('click', () => this.promoteSubLink(str, l1, l2, l3));
      this.grayOnHover(promoteSubLinkButton, color);
      let removeButton: HTMLDivElement = document.createElement('div');
      removeButton.innerHTML = 'Remove';
      removeButton.classList.add('contextButton');
      removeButton.addEventListener('click', () => this.deleteLink(str, l1, l2, l3));
      this.grayOnHover(removeButton, color);


      contextDiv.appendChild(promoteSubLinkButton);
      contextDiv.appendChild(removeButton);
      contextDiv.classList.add('contextDiv');
      threedots.appendChild(contextDiv);
      document.body.addEventListener('click', function (event) {
        if (threedots.contains(event.target)) {
          //  do nothing, click was inside container
        } else {
          contextDiv.style.display = 'none';
        }
      });
    }
    if (layer == 3) {
      let contextDiv: HTMLDivElement = document.createElement('div');
      if (iteration !== 0) {
        let moveUpButton: HTMLDivElement = document.createElement('div');
        moveUpButton.innerHTML = 'Move up';
        moveUpButton.classList.add('contextButton');
        moveUpButton.addEventListener('click', () => this.moveLinkUp(str, l1, l2, l3));
        this.grayOnHover(moveUpButton, color);
        contextDiv.appendChild(moveUpButton);
      }
      if (iteration !== layerLinks.length - 1) {
        let moveDownButton: HTMLDivElement = document.createElement('div');
        moveDownButton.innerHTML = 'Move down';
        moveDownButton.classList.add('contextButton');
        moveDownButton.addEventListener('click', () => this.moveLinkDown(str, l1, l2, l3));
        this.grayOnHover(moveDownButton, color);
        contextDiv.appendChild(moveDownButton);
      }
      let promoteSubLinkButton: HTMLDivElement = document.createElement('div');
      promoteSubLinkButton.innerHTML = 'Promote sub link';
      promoteSubLinkButton.classList.add('contextButton');
      promoteSubLinkButton.addEventListener('click', () => this.promoteSubLink(str, l1, l2, l3));
      this.grayOnHover(promoteSubLinkButton, color);
      let removeButton: HTMLDivElement = document.createElement('div');
      removeButton.innerHTML = 'Remove';
      removeButton.classList.add('contextButton');
      removeButton.addEventListener('click', () => this.deleteLink(str, l1, l2, l3));
      this.grayOnHover(removeButton, color);
      contextDiv.appendChild(promoteSubLinkButton);
      contextDiv.appendChild(removeButton);
      contextDiv.classList.add('contextDiv');
      threedots.appendChild(contextDiv);
      document.body.addEventListener('click', function (event) {
        if (threedots.contains(event.target)) {
          //  do nothing, click was inside container
        } else {
          contextDiv.style.display = 'none';
        }
      });

    }

    threedots.addEventListener('click', () => {
      threedots.style.backgroundColor = color;
      let childDivs = threedots.querySelectorAll('div');
      for (let i = 0; i < childDivs.length; i++) {
        let div = childDivs[i] as HTMLElement;
        div.style.display = 'block';
      }
    });
    this.grayOnHover(threedots, color);


  }

  // This function makes the buttons of the three dots context menues gray on hover
  public grayOnHover(div, color) {
    div.addEventListener('mouseenter', () => {
      div.style.backgroundColor = color;
    });
    div.addEventListener('mouseout', () => {
      div.style.backgroundColor = 'white';
    });
  }


  // This funciton creates a new link. It is called when the user clicks on the save button inside the add button context menu.
  public createNewLink(str, linkname, link, layer1Links, layer2Links, layer3Links) {
    let temparray = str.split('#');
    let i = temparray[0];
    let n = temparray[1];
    let m = temparray[2];


    if (n == 'no' && m == 'no') {
      if (i == String(layer1Links.length - 1)) {
        layer1Links.push([linkname, link]);
        layer2Links.push([[""]]);
        layer3Links.push([[[""]]]);
      }
      else {

        layer1Links.splice(Number(i) + 1, 0, [linkname, link]);
        layer2Links.splice(Number(i) + 1, 0, [[""]]);
        layer3Links.splice(Number(i) + 1, 0, [[[""]]]);
      }

      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }
    if (n !== 'no' && m == 'no') {
      if (n == String(layer2Links[i].length - 1)) {
        layer2Links[i].push([linkname, link]);
        layer3Links[i].push([[""]]);
      }
      else {
        layer2Links[i].splice(Number(n) + 1, 0, [linkname, link]);
        layer3Links[i].splice(Number(n) + 1, 0, [[""]]);
      }


      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }
    if (m !== 'no') {
      if (m == String(layer3Links[i][n].length - 1)) {
        layer3Links[i][n].push([linkname, link]);
      }
      else {
        layer3Links[i][n].splice(Number(m) + 1, 0, [linkname, link]);
      }


      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }

  }
  // Controller (All functions that interact with the model)

  /*This function saves the links to the field "NavLinks" of the first item in the list NavList.
  In order to do this the function has to create the string that gets stored in the list by joining all elements of the layerLinks arrays together.
  A short reminder: The string uses:

    %= as separator between link name and link
    %! as separator between layer 3 links
    %? as separator between layer 2 links
    %# as separator between layer 1 links
    %& as separator between layers

    */
  public saveLinks(layer1links, layer2links, layer3links) {

    // Create layer 1 string
    for (let i = 0; i < layer1links.length; i++) {
      layer1links[i] = layer1links[i].join('%=');
    }
    layer1links = layer1links.join('%#');

    // Create layer 2 string
    for (let i = 0; i < layer2links.length; i++) {
      for (let n = 0; n < layer2links[i].length; n++) {
        if (layer2links[i][n] !== "") {
          layer2links[i][n] = layer2links[i][n].join('%=');
        }
      }
    }
    for (let i = 0; i < layer2links.length; i++) {
      layer2links[i] = layer2links[i].join('%?');
    }
    layer2links = layer2links.join('%#');

    // Create layer 3 string
    for (let i = 0; i < layer3links.length; i++) {
      for (let n = 0; n < layer3links[i].length; n++) {
        for (let m = 0; m < layer3links[i][n].length; m++) {
          if (layer3links[i][n][m] !== "") {
            layer3links[i][n][m] = layer3links[i][n][m].join('%=');
          }
        }
      }

    }
    for (let i = 0; i < layer3links.length; i++) {
      for (let n = 0; n < layer3links[i].length; n++) {
        layer3links[i][n] = layer3links[i][n].join('%!');
      }
    }
    for (let i = 0; i < layer3links.length; i++) {
      layer3links[i] = layer3links[i].join('%?');
    }
    layer3links = layer3links.join('%#');

    // Create navString that gets saved to NavList
    let navString = layer1links + '%&' + layer2links + '%&' + layer3links;



    // Save navString to NavList
    const endpoint: string = this.rootSiteCollectionUrl + "/_api/web/lists/getbytitle('NavList')/items(1)";
    const headers: any = {
      'Content-type': 'application/json;odata=nometadata',
      'odata-version': '4.0',
      'IF-MATCH': "*",
      'X-HTTP-Method': 'MERGE'
    };
    headers["IF-MATCH"] = "*";
    headers["X-HTTP-Method"] = "MERGE";
    const body: string = JSON.stringify({ '@odata.type': 'SP.Data.NavListListItem', ["NavLinks"]: navString });
    this.context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, { headers: headers, body: body })
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          this.editNavigation();
          let navdiv = document.querySelector('.navdiv') as HTMLElement | null;
          this.renderNavdiv(navdiv);
        }
      })
      .catch((error) => {
        console.error(error);
      });




  }
  /*This function deletes a link. It is called if the remove button is clicked inside the three dots context menu.
  The function basically removes the links from the layerLinks arrays and then calls the saveLinks() function in order to save the changed arrays*/
  public deleteLink(str, layer1Links, layer2Links, layer3Links) {
    let temparray = str.split('#');
    let i = temparray[0];
    let n = temparray[1];
    let m = temparray[2];


    if (n == 'no' && m == 'no') {
      if (i == String(layer1Links.length - 1)) {
        layer1Links.pop();
        layer2Links.pop();
        layer3Links.pop();
      }
      else {

        layer1Links.splice(Number(i), 1);
        layer2Links.splice(Number(i), 1);
        layer3Links.splice(Number(i), 1);
      }
      this.saveLinks(layer1Links, layer2Links, layer3Links);
    }
    if (n !== 'no' && m == 'no') {
      if (n == String(layer2Links[i].length - 1)) {
        layer2Links[Number(i)].pop();
        layer3Links[Number(i)].pop();
      }
      else {
        layer2Links[Number(i)].splice(Number(n), 1);
        layer3Links[Number(i)].splice(Number(n), 1);
      }


      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }
    if (m !== 'no') {
      if (m == String(layer3Links[i][n].length - 1)) {
        layer3Links[Number(i)][Number(n)].pop();
      }
      else {
        layer3Links[Number(i)][Number(n)].splice(Number(m), 1);
      }

      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }
  }
  // This function moves a link up. It is called when clicking on the "Move up" button inside the three dots context menu.
  public moveLinkUp(str, layer1links, layer2links, layer3links) {
    let temparray = str.split('#');
    let i = temparray[0];
    let n = temparray[1];
    let m = temparray[2];


    if (n == 'no' && m == 'no') {
      let temp = layer1links[Number(i) - 1];
      layer1links[Number(i) - 1] = layer1links[Number(i)];
      layer1links[Number(i)] = temp;
      temp = layer2links[Number(i) - 1];
      layer2links[Number(i) - 1] = layer2links[Number(i)];
      layer2links[Number(i)] = temp;
      temp = layer3links[Number(i) - 1];
      layer3links[Number(i) - 1] = layer3links[Number(i)];
      layer3links[Number(i)] = temp;

      this.saveLinks(layer1links, layer2links, layer3links);

    }

    if (n !== 'no' && m == 'no') {
      let temp = layer2links[Number(i)][Number(n) - 1];
      layer2links[Number(i)][Number(n) - 1] = layer2links[Number(i)][Number(n)];
      layer2links[Number(i)][Number(n)] = temp;
      temp = layer3links[i][Number(n) - 1];
      layer3links[Number(i)][Number(n) - 1] = layer3links[Number(i)][Number(n)];
      layer3links[Number(i)][Number(n)] = temp;

      this.saveLinks(layer1links, layer2links, layer3links);

    }
    if (m !== 'no') {
      let temp = layer3links[Number(i)][Number(n)][Number(m) - 1];
      layer3links[Number(i)][Number(n)][Number(m) - 1] = layer3links[Number(i)][Number(n)][Number(m)];
      layer3links[Number(i)][Number(n)][Number(m)] = temp;

      this.saveLinks(layer1links, layer2links, layer3links);

    }
  }
  // This function moves a link down. It is called when clicking on the "Move down" button inside the three dots context menu.
  public moveLinkDown(str, layer1links, layer2links, layer3links) {
    let temparray = str.split('#');
    let i = temparray[0];
    let n = temparray[1];
    let m = temparray[2];


    if (n == 'no' && m == 'no') {
      let temp = layer1links[Number(i) + 1];
      layer1links[Number(i) + 1] = layer1links[Number(i)];
      layer1links[Number(i)] = temp;
      temp = layer2links[Number(i) + 1];
      layer2links[Number(i) + 1] = layer2links[Number(i)];
      layer2links[Number(i)] = temp;
      temp = layer3links[Number(i) + 1];
      layer3links[Number(i) + 1] = layer3links[Number(i)];
      layer3links[Number(i)] = temp;


      this.saveLinks(layer1links, layer2links, layer3links);

    }

    if (n !== 'no' && m == 'no') {
      let temp = layer2links[Number(i)][Number(n) + 1];
      layer2links[Number(i)][Number(n) + 1] = layer2links[Number(i)][Number(n)];
      layer2links[Number(i)][Number(n)] = temp;
      let temp2 = layer3links[Number(i)][Number(n) + 1];
      layer3links[Number(i)][Number(n) + 1] = layer3links[Number(i)][Number(n)];
      layer3links[Number(i)][Number(n)] = temp2;

      this.saveLinks(layer1links, layer2links, layer3links);

    }
    if (m !== 'no') {
      let temp = layer3links[Number(i)][Number(n)][Number(m) + 1];
      layer3links[Number(i)][Number(n)][Number(m) + 1] = layer3links[Number(i)][Number(n)][Number(m)];
      layer3links[Number(i)][Number(n)][Number(m)] = temp;

      this.saveLinks(layer1links, layer2links, layer3links);

    }
  }
  // This function moves a link one layer down. It is called when clicking on the "Make sublink" butto inside the three dots context menu
  public makeSubLink(str, layer1Links, layer2Links, layer3Links) {

    let temparray = str.split('#');
    let i = temparray[0];
    let n = temparray[1];
    let m = temparray[2];

    if (n == 'no' && m == 'no') {
      if (layer2Links[Number(i) - 1][0][0] == "") {
        layer2Links[Number(i) - 1].splice(0, 1, [layer1Links[Number(i)][0], layer1Links[Number(i)][1]]);

      }
      else {
        layer2Links[Number(i) - 1].push([layer1Links[Number(i)][0], layer1Links[Number(i)][1]]);
        layer3Links[Number(i) - 1].push([""]);
      }

      if (i == String(layer1Links.length - 1)) {
        layer1Links.pop();
        layer2Links.pop();
        layer3Links.pop();
      }
      else {

        layer1Links.splice(Number(i), 1);
        layer2Links.splice(Number(i), 1);
        layer3Links.splice(Number(i), 1);
      }




      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }
    if (n !== 'no' && m == 'no') {
      if (layer3Links[Number(i)][Number(n) - 1][0][0] == "") {
        layer3Links[Number(i)][Number(n) - 1].splice(0, 1, [layer2Links[Number(i)][Number(n)][0], layer2Links[Number(i)][Number(n)][1]]);
      }
      else {
        layer3Links[Number(i)][Number(n) - 1].push([layer2Links[Number(i)][Number(n)][0], layer2Links[Number(i)][Number(n)][1]]);
      }

      if (n == String(layer2Links[i].length - 1)) {
        layer2Links[Number(i)].pop();
        layer3Links[Number(i)].pop();
      }
      else {
        layer2Links[Number(i)].splice(Number(n), 1);
        layer3Links[Number(i)].splice(Number(n), 1);
      }




      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }


  }
  // This function moves a link one layer up. It is called when clicking on the "Promote sublink" button inside the three dots context menu
  public promoteSubLink(str, layer1Links, layer2Links, layer3Links) {

    let temparray = str.split('#');
    let i = temparray[0];
    let n = temparray[1];
    let m = temparray[2];


    if (n !== 'no' && m == 'no') {

      layer1Links.splice(Number(i) + 1, 0, [layer2Links[Number(i)][Number(n)][0], layer2Links[Number(i)][Number(n)][1]])
      layer2Links.splice(Number(i) + 1, 0, layer3Links[Number(i)][Number(n)])
      layer3Links.splice(Number(i) + 1, 0, [[[""]]]);
      for (let a = 0; a < layer2Links[Number(i) + 1].length; a++) {
        layer3Links[Number(i) + 1].splice(a, 1, [[""]]);
      }

      layer2Links[Number(i)].splice(Number(n), 1);
      layer3Links[Number(i)].splice(Number(n), 1);

      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }

    if (n !== 'no' && m !== 'no') {
      layer2Links[Number(i)].splice(Number(n) + 1, 0, layer3Links[Number(i)][Number(n)][Number(m)]);
      layer3Links[Number(i)][Number(n)].splice(Number(m), 1);
      layer3Links[Number(i)].splice(Number(n) + 1, 0, [""]);

      this.saveLinks(layer1Links, layer2Links, layer3Links);

    }



  }
  // Model (All functions that have to do with data handling

  // This function gets the list item where the links are stored from the NavList
  public getListItems(): Promise<any> {
    const listName: string = 'NavList';
    const columns: string[] = ['Title', 'NavLinks'];
    const selectColumns: string = columns.join(',');

    return this.context.spHttpClient.get(this.rootSiteCollectionUrl + `/_api/web/lists/getbytitle('${listName}')/items?$select=${selectColumns}`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      .then(jsonResponse => {
        return jsonResponse.value;
      }) as Promise<any>;
  }

  // This function checks if the NavList already exists. If no, the function creeateNavList() is called in order to create the NavList
  public checkListExists(): any {
    this.context.spHttpClient.get(this.rootSiteCollectionUrl + '/_api/web/lists',
      SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        response.json().then((lists: any) => {
          let listExists = lists.value.some(list => list.Title == 'NavList');
          if (listExists) {
            return true;
          } else {
            this.createNavList();
            return false;

          }
        });
      });
  }

  // This function creates the NavList
  public createNavList() {
    let urlToPost: string = `${this.rootSiteCollectionUrl}/_api/web/lists`;
    let listBody: any = {
      'Title': 'NavList',
      'Description': 'List for navigation links',
      'AllowContentTypes': false,
      'BaseTemplate': 100,
    };
    let spHttpClientOptions: ISPHttpClientOptions = {
      'body': JSON.stringify(listBody)
    };
    return new Promise<boolean>((resolve, reject) => {
      this.context.spHttpClient.post(urlToPost, SPHttpClient.configurations.v1, spHttpClientOptions).then((response: SPHttpClientResponse) => {
        if (response.ok) {
          if (response.status == 201) {
            this.addColumnToList('NavLinks');

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

  // This funciton adds a column to the NavList. The column will have the name "NavLinks"
  public addColumnToList(columnName) {
    const url: string = this.rootSiteCollectionUrl + `/_api/web/lists/getbytitle('NavList')/fields`;
    let options: ISPHttpClientOptions = {
      body: JSON.stringify({
        'Title': columnName,
        'FieldTypeKind': 3
      }),
      headers: {
        'accept': 'application/json;odata=nometadata',
        'content-type': 'application/json;odata=nometadata',
        'odata-version': '3.0'
      }
    };

    return new Promise<boolean>((resolve, reject) => {
      this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((response: SPHttpClientResponse) => {
        if (response.ok) {
          if (response.status == 201) {
            this.createListItem();
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

  /*This function creates the list item inside the NavList where the navigation links will be stored in the field "NavLinks". 
  https:// bing.com is added as the first link by default*/
  public createListItem() {
    const url: string = this.rootSiteCollectionUrl + `/_api/web/lists/getbytitle('NavList')/items`;
    let options: ISPHttpClientOptions = {
      body: JSON.stringify({
        'Title': 'My New Item',
        'NavLinks': 'Bing%=https:// bing.com%&%&'
      }),
      headers: {
        'accept': 'application/json;odata=nometadata',
        'content-type': 'application/json;odata=nometadata',
        'odata-version': '3.0'
      }
    };
    this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, options);
  }
}


