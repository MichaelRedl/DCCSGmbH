import * as React from 'react';
import QuickLinksCustom from '../QuicklinksCustom/QuickLinksCustom';
import EditQuicklinks from '../EditQuicklinks/EditQuicklinks';
import styles from '../QuickLinksCustom.module.scss';
/* tslint:disable:no-any */
export interface IProps {
  description: string;
  context: any;
  columns: number;
  heading: string;
  headingsize: number;
}
export interface IState {
  showEditQuicklinks: boolean;
}
class QuicklinksContainer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      showEditQuicklinks: false
    };
  }
  public handleButtonClick = (): void => {
    this.setState({
      showEditQuicklinks: !this.state.showEditQuicklinks
    });
  }
  public closeButton = (): void => {
    this.setState({
      showEditQuicklinks: false
    });
  }
  public render(): React.ReactElement<IProps> {
    const buttonStyle: React.CSSProperties = {
      position: 'relative',
      top: '0',
      right: '2.6%',
      cursor: 'pointer',
      backgroundColor: 'RGB(0,0,0,0)',
      border: 'none',
      width: '100%',
      textAlign: 'right'
      //  paddingBottom: '300px'
    };
   /* const quickLinksStyle: React.CSSProperties = {
      marginTop: '400px'
    };*/
    return (
      <div className={styles.customFont}>
        <div className={styles.headingContainer}>
        <div className={styles.customHeading} style={{ fontSize: this.props.headingsize }}>
           {this.props.heading}</div>
        <button onClick={this.handleButtonClick} style={buttonStyle}>
          Links bearbeiten
        </button>
        </div>
        {!this.state.showEditQuicklinks && (
          <QuickLinksCustom description={this.props.description} context={this.props.context}
           columns={this.props.columns}/*style={quickLinksStyle}*/ />
        )}

        {this.state.showEditQuicklinks && (
          <div>
            <EditQuicklinks description={this.props.description} context={this.props.context}
             handleButtonClick={this.handleButtonClick} /*style={quickLinksStyle}*/ />
          </div>
        )}
      </div>
    );
  }
}
export default QuicklinksContainer;