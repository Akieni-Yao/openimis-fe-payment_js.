import React, { Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from 'react-intl';
import {
    Grid,
} from "@material-ui/core";
import {
    withHistory,
    withModulesManager,
    AmountInput,
    TextInput,
    PublishedComponent,
    FormPanel,
} from "@openimis/fe-core";


const styles = theme => ({
    tableTitle: theme.table.title,
    item: theme.paper.item,
    fullHeight: {
        height: "100%"
    },
});

class PaymentMasterPanel extends FormPanel {
    render() {
        const {
            intl,
            classes,
            edited,
            readOnly,
            overview,
        } = this.props;
        return (
            <Fragment>
                <Grid container className={classes.item}>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent pubRef="core.DatePicker"
                            value={!edited ? "" : edited.receivedDate}
                            module="payment"
                            label="payment.receivedDate"
                            readOnly={readOnly}
                            onChange={p => this.updateAttribute('receivedDate', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="payment"
                            label="Payment Code"
                            readOnly={true}
                            value={!edited ? "" : edited.paymentCode}
                        // onChange={p => this.updateAttribute('receiptNo', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent pubRef="core.DatePicker"
                            value={!edited ? "" : edited.requestDate}
                            module="payment"
                            label="payment.requestDate"
                            readOnly={readOnly}
                            onChange={p => this.updateAttribute('requestDate', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent pubRef="core.DatePicker"
                            value={!edited ? "" : edited.matchedDate}
                            module="payment"
                            label="payment.matchedDate"
                            readOnly={readOnly}
                            onChange={p => this.updateAttribute('matchedDate', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent pubRef="core.DatePicker"
                            value={!edited ? "" : edited.dateLastSms}
                            module="payment"
                            label="payment.dateLastSms"
                            readOnly={readOnly}
                            onChange={p => this.updateAttribute('dateLastSms', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <AmountInput
                            module="payment"
                            label="payment.expectedAmount"
                            readOnly={readOnly}
                            value={!edited ? "" : edited.expectedAmount}
                            onChange={p => this.updateAttribute('expectedAmount', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <AmountInput
                            module="payment"
                            label="payment.receivedAmount"
                            readOnly={readOnly}
                            value={!edited ? "" : edited.receivedAmount}
                            onChange={p => this.updateAttribute('receivedAmount', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <AmountInput
                            module="payment"
                            label="payment.transferFee"
                            readOnly={readOnly}
                            value={!edited ? "" : edited.transferFee}
                            onChange={p => this.updateAttribute('transferFee', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubRef="contribution.PremiumPaymentTypePicker"
                            withNull={true}
                            required
                            readOnly={readOnly}
                            value={!edited ? "" : edited.typeOfPayment}
                            onChange={p => this.updateAttribute('typeOfPayment', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="payment"
                            label="payment.receiptNo"
                            readOnly={readOnly}
                            value={!edited ? "" : edited.receiptNo}
                            onChange={p => this.updateAttribute('receiptNo', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                            pubRef="payment.PaymentStatusPicker"
                            withNull={true}
                            readOnly={readOnly}
                            value={!edited ? "" : edited.status}
                            onChange={p => this.updateAttribute('status', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="payment"
                            label="payment.origin"
                            readOnly={readOnly}
                            value={!edited ? "" : edited.origin}
                            onChange={p => this.updateAttribute('origin', p)}
                        />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="payment"
                            label="payment.officerCode"
                            readOnly={readOnly}
                            value={!edited ? "" : edited.officerCode}
                            onChange={p => this.updateAttribute('officerCode', p)}
                        />
                    </Grid>
                    {/*  TO-DO: InsureeOfficerPicker is using officer ID and we only have the code */}
                    {/* <Grid item xs={3} className={classes.item} >
                        <PublishedComponent pubRef="insuree.InsureeOfficerPicker"
                            value={!edited ? "" : edited.officerCode}
                            module="payment"
                            label={formatMessage(intl, "payment", "payment.officer")}
                            readOnly={readOnly}
                            onChange={v => this.updateAttribute('officerCode', v ? v.code : null)}
                        />
                    </Grid> */}
                    {/*  TO-DO: rejectedReason is set to null in the back if updated */}
                    {/* <Grid item xs={3} className={classes.item}>
                        <TextInput
                            module="payment"
                            label="payment.rejectedReason"
                            readOnly={readOnly}
                            value={!edited ? "" : edited.rejectedReason}
                            onChange={p => this.updateAttribute('rejectedReason', p)}
                        />
                    </Grid> */}
                </Grid>
            </Fragment>
        );
    }
}

export default withModulesManager(withHistory(injectIntl(withTheme(
    withStyles(styles)(PaymentMasterPanel)
))));