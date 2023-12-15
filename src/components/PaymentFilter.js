import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid, Checkbox, FormControlLabel } from "@material-ui/core";
import {
  withModulesManager,
  AmountInput,
  PublishedComponent,
  ControlledField,
  TextInput,
  formatMessage,
} from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
    width: "100%",
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

const PAYMENT_FILTER_CONTRIBUTION_KEY = "payment.Filter";

class PaymentFilter extends Component {
  state = {
    showHistory: false,
    showReconciled: false,
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.filters["showHistory"] !== this.props.filters["showHistory"] &&
      !!this.props.filters["showHistory"] &&
      this.state.showHistory !== this.props.filters["showHistory"]["value"]
    ) {
      this.setState((state, props) => ({
        showHistory: props.filters["showHistory"]["value"],
      }));
    }
  }

  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-payment", "debounceTime", 800)
  );

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _onChangeShowHistory = () => {
    let filters = [
      {
        id: "showHistory",
        value: !this.state.showHistory,
        filter: `showHistory: ${!this.state.showHistory}`,
      },
    ];
    this.props.onChangeFilters(filters);
    this.setState((state) => ({
      showHistory: !state.showHistory,
    }));
  };

  _onChangeShowReconciled = () => {
    let filters = [
      {
        id: "showReconciled",
        value: !this.state.showReconciled,
        filter: `showReconciled: ${!this.state.showReconciled}`,
      },
    ];
    this.props.onChangeFilters(filters);
    this.setState((state) => ({
      showReconciled: !state.showReconciled,
    }));
  };

  render() {
    const { classes, filters, onChangeFilters, intl } = this.props;
    return (
      <section className={classes.form}>
        <Grid container>
          <ControlledField
            module="payment"
            id="PaymentFilter.typeOfPayment"
            field={
              <Grid item xs={3} className={classes.item}>
                <PublishedComponent
                  pubRef="contribution.PremiumPaymentTypePicker"
                  withNull={true}
                  value={this._filterValue("typeOfPayment")}
                  onChange={(v) =>
                    onChangeFilters([
                      {
                        id: "typeOfPayment",
                        value: v,
                        filter: !!v ? `typeOfPayment: "${v}"` : null,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          <ControlledField
            module="contribution"
            id="payment_code"
            field={
              <Grid item xs={3} className={classes.item}>
                <TextInput
                  module="payment"
                  label="Payment Code"
                  name="payment_code"
                  value={this._filterValue("payment_code")}
                  onChange={(v) =>
                    this.debouncedOnChangeFilter([
                      {
                        id: "payment_code",
                        value: v,
                        filter: `paymentCode_Icontains: "${v}"`,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          <ControlledField
            module="payment"
            id="PaymentFilter.status"
            field={
              <Grid item xs={3} className={classes.item}>
                <PublishedComponent
                  pubRef="payment.PaymentStatusPicker"
                  withNull={true}
                  value={this._filterValue("status")}
                  onChange={(v) =>
                    onChangeFilters([
                      {
                        id: "status",
                        value: v,
                        filter: !!v ? `status: ${v}` : null,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
          <ControlledField
            module="contribution"
            id="PaymentFilter.receiptNo"
            field={
              <Grid item xs={3} className={classes.item}>
                <TextInput
                  module="payment"
                  label="payment.receiptNo"
                  name="receiptNo"
                  value={this._filterValue("receiptNo")}
                  onChange={(v) =>
                    this.debouncedOnChangeFilter([
                      {
                        id: "receiptNo",
                        value: v,
                        filter: `receiptNo_Icontains: "${v}"`,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
        </Grid>
        <Grid container>
          <ControlledField
            module="payment"
            id="PaymentFilter.requestDate"
            field={
              <Grid item xs={6}>
                <Grid container>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue("requestDateFrom")}
                      module="payment"
                      label="payment.requestDateFrom"
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: "requestDateFrom",
                            value: d,
                            filter: `requestDate_Gte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue("requestDateTo")}
                      module="payment"
                      label="payment.requestDateTo"
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: "requestDateTo",
                            value: d,
                            filter: `requestDate_Lte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
          <ControlledField
            module="payment"
            id="PaymentFilter.receivedDate"
            field={
              <Grid item xs={6}>
                <Grid container>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue("receivedDateFrom")}
                      module="payment"
                      label="payment.receivedDateFrom"
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: "receivedDateFrom",
                            value: d,
                            filter: `receivedDate_Gte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue("receivedDateTo")}
                      module="payment"
                      label="payment.receivedDateTo"
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: "receivedDateTo",
                            value: d,
                            filter: `receivedDate_Lte: "${d}"`,
                          },
                        ])
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
        </Grid>
        <Grid container>
          {["expectedAmount_Gte", "expectedAmount_Lte"].map((a) => (
            <ControlledField
              module="payment"
              id="PaymentFilter.amountUnder"
              key={a}
              field={
                <Grid item xs={3} className={classes.item}>
                  <AmountInput
                    module="payment"
                    label={`payment.${a}`}
                    value={filters[a] && filters[a]["value"]}
                    onChange={(v) =>
                      this.debouncedOnChangeFilter([
                        {
                          id: a,
                          value: !v ? null : v,
                          filter: !!v ? `${a}: ${v}` : null,
                        },
                      ])
                    }
                  />
                </Grid>
              }
            />
          ))}
          {["receivedAmount_Gte", "receivedAmount_Lte"].map((a) => (
            <ControlledField
              module="payment"
              id="PaymentFilter.amountUnder"
              key={a}
              field={
                <Grid item xs={3} className={classes.item}>
                  <AmountInput
                    module="payment"
                    label={`payment.${a}`}
                    value={filters[a] && filters[a]["value"]}
                    onChange={(v) =>
                      this.debouncedOnChangeFilter([
                        {
                          id: a,
                          value: !v ? null : v,
                          filter: !!v ? `${a}: ${v}` : null,
                        },
                      ])
                    }
                  />
                </Grid>
              }
            />
          ))}
        </Grid>

        <Grid container>
          <ControlledField
            module="payment"
            id="PaymentFilter.showReconciled"
            field={
              <Grid item xs={2} className={classes.item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={this.state.showReconciled}
                      onChange={(e) => this._onChangeShowReconciled()}
                    />
                  }
                  label={formatMessage(intl, "payment", "showReconciledOnly")}
                />
              </Grid>
            }
          />
        </Grid>

        <Grid container justify="flex-end">
          <ControlledField
            module="payment"
            id="PaymentFilter.showHistory"
            field={
              <Grid item xs={2} className={classes.item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={this.state.showHistory}
                      onChange={(e) => this._onChangeShowHistory()}
                    />
                  }
                  label={formatMessage(intl, "payment", "showHistory")}
                />
              </Grid>
            }
          />
        </Grid>
      </section>
    );
  }
}

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(PaymentFilter)))
);
