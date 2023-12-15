import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay";
import {
  Helmet,
  formatMessageWithValues,
  withModulesManager,
  withHistory,
  historyPush,
  Form,
  ProgressOrError,
  journalize,
  coreConfirm,
} from "@openimis/fe-core";
import { RIGHT_PAYMENT } from "../constants";

import {
  fetchPayment,
  newPayment,
  createPayment,
  printReport,
} from "../actions";
import PaymentMasterPanel from "./PaymentMasterPanel";

const styles = (theme) => ({
  lockedPage: theme.page.locked,
});

const PAYMENT_OVERVIEW_MUTATIONS_KEY = "payment.PaymentOverview.mutations";

class PaymentForm extends Component {
  state = {
    lockNew: false,
    reset: 0,
    payment: this._newPayment(),
    newPayment: true,
    consirmedAction: null,
  };

  _newPayment() {
    return {};
  }

  componentDidMount() {
    if (this.props.payment_uuid) {
      this.setState(
        (state, props) => ({ payment_uuid: props.payment_uuid }),
        (e) =>
          this.props.fetchPayment(
            this.props.modulesManager,
            this.props.payment_uuid
          )
      );
    }
    if (this.props.premium_uuid) {
      this.setState({
        payment: {
          ...this._newPayment(),
          premium_uuid: this.props.premium_uuid,
        },
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.fetchedPayment && !!this.props.fetchedPayment) {
      const { payment } = this.props;
      this.setState({
        payment,
        payment_uuid: payment.uuid,
        lockNew: false,
        newPayment: false,
      });
    } else if (prevProps.payment_uuid && !this.props.payment_uuid) {
      this.setState({
        payment: this._newPayment(),
        newPayment: true,
        lockNew: false,
        payment_uuid: null,
      });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state, props) => ({
        payment: {
          ...state.payment,
          clientMutationId: props.mutation.clientMutationId,
        },
      }));
    } else if (
      prevProps.confirmed !== this.props.confirmed &&
      !!this.props.confirmed &&
      !!this.state.confirmedAction
    ) {
      this.state.confirmedAction();
    }
  }

  reload = () => {
    const { payment } = this.state;
    this.props.fetchPayment(
      this.props.modulesManager,
      this.state.payment_uuid,
      payment.clientMutationId
    );
  };

  canSave = () => {
    if (!this.state.payment.typeOfPayment) return false;
    return true;
  };

  _save = (payment) => {
    this.setState(
      { lockNew: !payment.uuid }, // avoid duplicates
      (e) => this.props.save(payment)
    );
  };

  onEditedChanged = (payment) => {
    this.setState({ payment, newPayment: false });
  };

  onActionToConfirm = (title, message, confirmedAction) => {
    this.setState({ confirmedAction }, this.props.coreConfirm(title, message));
  };
  displayPrintWindow = (base64Data, contentType) => {
    const printWindow = window.open(
      "",
      "Print Window",
      "width=600, height=400"
    );
    printWindow.document.open();

    if (contentType === "pdf") {
      // printWindow.print(`<embed type="application/pdf" width="100%" height="100%" src="data:application/pdf;base64,${base64Data}" />`);
      printWindow.document.write(
        `<embed type="application/pdf" width="100%" height="100%" src="data:application/pdf;base64,${base64Data}" />`
      );
    } else {
      printWindow.document.write(
        `<img src="data:image/png;base64,${base64Data}" />`
      );
    }

    printWindow.document.close();
    // printWindow.print();
  };
  printReport = async (edited) => {
    const data = await this.props.printReport(
      this.props.modulesManager,
      edited
    );
    const base64Data = data?.payload?.data?.printPaymentReceipt?.data;

    const contentType = "pdf";
    if (base64Data) {
      this.displayPrintWindow(base64Data, contentType);
    }
  };
  render() {
    const {
      modulesManager,
      classes,
      state,
      rights,
      payment_uuid,
      fetchingPayment,
      fetchedPayment,
      errorPayment,
      overview = false,
      readOnly = false,
      add,
      save,
      back,
    } = this.props;
    const { payment, newPayment, reset } = this.state;
    if (!rights.includes(RIGHT_PAYMENT)) return null;
    const runningMutation = !!payment && !!payment.clientMutationId;
    let contributedMutations = modulesManager.getContribs(
      PAYMENT_OVERVIEW_MUTATIONS_KEY
    );
    for (let i = 0; i < contributedMutations.length && !runningMutation; i++) {
      runningMutation = contributedMutations[i](state);
    }
    const actions = [
      {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly && !runningMutation,
      },
    ];
    return (
      <div className={!!runningMutation ? classes.lockedPage : null}>
        <Helmet
          title={formatMessageWithValues(
            this.props.intl,
            "payment",
            "PaymentOverview.title"
          )}
        />
        <ProgressOrError progress={fetchingPayment} error={errorPayment} />
        {((!!fetchedPayment && !!payment && payment.uuid === payment_uuid) ||
          !payment_uuid) && (
          <Form
            module="payment"
            title={
              !!newPayment
                ? "PaymentOverview.newTitle"
                : "PaymentOverview.title"
            }
            edited_id={payment_uuid}
            edited={payment}
            reset={reset}
            back={back}
            // add={!!add && !newPayment ? this._add : null}
            readOnly={
              readOnly || runningMutation || (!!payment && !!payment.validityTo)
            }
            actions={actions}
            overview={overview}
            HeadPanel={PaymentMasterPanel}
            payment={payment}
            onEditedChanged={this.onEditedChanged}
            canSave={this.canSave}
            save={!!save ? this._save : null}
            onActionToConfirm={this.onActionToConfirm}
            openDirty={save}
            paymentPrint={payment_uuid}
            printButton={this.printReport}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  fetchingPayment: state.payment.fetchingPayment,
  errorPayment: state.payment.errorPayment,
  fetchedPayment: state.payment.fetchedPayment,
  submittingMutation: state.payment.submittingMutation,
  mutation: state.payment.mutation,
  payment: state.payment.payment,
  confirmed: state.core.confirmed,
  state: state,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchPayment,
      newPayment,
      createPayment,
      printReport,
      journalize,
      coreConfirm,
    },
    dispatch
  );
};

export default withHistory(
  withModulesManager(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(injectIntl(withTheme(withStyles(styles)(PaymentForm))))
  )
);
