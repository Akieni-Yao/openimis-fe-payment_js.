import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import ReplayIcon from "@material-ui/icons/Replay"
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Paper, Grid, Divider, Typography, IconButton, Tooltip } from "@material-ui/core";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@material-ui/icons';

import {
    formatMessageWithValues, formatAmount, formatDateFromISO, withModulesManager, formatMessage, withTooltip,
    formatSorter, sort,
    journalize,
    PublishedComponent, Table, PagedDataHandler, historyPush
} from "@openimis/fe-core";

import { fetchPremiumsPayments, deletePayment } from "../actions";
import DeletePaymentDialog from "./DeletePaymentDialog";

import {
    RIGHT_PAYMENT_DELETE,
    RIGHT_PAYMENT_ADD,
} from "../constants";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    tableTitle: theme.table.title,
    fab: theme.fab,
    disabled: {
        opacity: 0.4,
    }
});

class PremiumsPaymentsOverview extends PagedDataHandler {

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf("fe-insuree", "premiumsPaymentsOverview.rowsPerPageOptions", [5, 10, 20]);
        this.defaultPageSize = props.modulesManager.getConf("fe-insuree", "premiumsPaymentsOverview.defaultPageSize", 5);
    }

    componentDidMount() {
        this.setState({
            orderBy: "-requestDate",
            deletePayment: null,
        }, e => this.query())
    }

    addNewPayment = () => {
        const {
            premium,
            modulesManager,
            history,
        } = this.props;
        historyPush(modulesManager, history, "payment.paymentNew", [premium.uuid]);
    }

    deletePayment = () => {
        let payment = this.state.deletePayment;
        this.setState(
            { deletePayment: null },
            (e) => {
                this.props.deletePayment(
                    this.props.modulesManager,
                    payment,
                    formatMessage(this.props.intl, "payment", "deletePaymentDialog.title"))
            })
    }

    onDoubleClick = (i, newTab = false) => {
        const {
            modulesManager,
            history,
        } = this.props;
        historyPush(modulesManager, history, "payment.paymentOverview", [i.uuid], newTab);
    }


    premiumsChanged = (prevProps) =>
        (!_.isEqual(prevProps.policiesPremiums, this.props.policiesPremiums) && !!this.props.policiesPremiums && !!this.props.policiesPremiums.length) ||
        (!_.isEqual(prevProps.premium, this.props.premium))

    componentDidUpdate(prevProps) {
        if (this.premiumsChanged(prevProps)) {
            this.query();
        }
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
        }
    }

    queryPrms = () => {
        let prms = [`orderBy: "${this.state.orderBy}"`];
        if (!!this.props.premium) {
            prms.push(`premiumUuids: ${JSON.stringify([this.props.premium.uuid])}`);
            return prms;
        } else if (this.props.policiesPremiums && !!this.props.policiesPremiums.length) {
            prms.push(`premiumUuids: ${JSON.stringify((this.props.policiesPremiums || []).map(p => p.uuid))}`);
            return prms;
        }
        return null;
    }

    headers = [
        "Payment Code",
        "payment.payment.typeOfPayment",
        "payment.payment.requestDate",
        "payment.payment.expectedAmount",
        "payment.payment.receivedDate",
        "payment.payment.receivedAmount",
        "payment.payment.receiptNo",
        "payment.payment.status",
        "",
    ];

    sorter = (attr, asc = true) => [
        () => this.setState((state, props) => ({ orderBy: sort(state.orderBy, attr, asc) }), e => this.query()),
        () => formatSorter(this.state.orderBy, attr, asc)
    ]

    headerActions = [
        this.sorter("typeOfPayment"),
        this.sorter("requestDate"),
        this.sorter("expectedAmount"),
        this.sorter("receivedDate"),
        this.sorter("receivedAmount"),
        this.sorter("receiptNo"),
        this.sorter("status"),
    ];

    confirmDelete = deletePayment => {
        this.setState({ deletePayment, })
    }

    deletePaymentAction = (i) =>
        !!i.validityTo || !!i.clientMutationId ? null :
            <Tooltip title={formatMessage(this.props.intl, "payment", "deletePayment.tooltip")}>
                <IconButton onClick={() => this.confirmDelete(i)}><DeleteIcon /></IconButton>
            </Tooltip>

    itemFormatters = () => {
        const formatters = [
            p => p.paymentCode,
            p => p.typeOfPayment,
            p => formatDateFromISO(this.props.modulesManager, this.props.intl, p.requestDate),
            p => formatAmount(this.props.intl, p.expectedAmount),
            p => formatDateFromISO(this.props.modulesManager, this.props.intl, p.receivedDate),
            p => formatAmount(this.props.intl, p.receivedAmount),
            p => p.receiptNo,
            p => <PublishedComponent
                readOnly={true}
                pubRef="payment.PaymentStatusPicker"
                withLabel={false}
                value={p.status}
                nullLabel="payment.status.none"
            />,
        ];
        if (!!this.props.rights.includes(RIGHT_PAYMENT_DELETE)) {
            formatters.push(this.deletePaymentAction)
        }
        return formatters;
    };

    header = () => {
        const { modulesManager, intl, pageInfo, premium } = this.props;
        if (!!premium && !!premium.uuid) {
            return formatMessageWithValues(
                intl, "payment", "PremiumsPaymentsOfPremium",
                {
                    count: pageInfo.totalCount,
                    premium: `${formatDateFromISO(modulesManager, intl, premium.payDate)}`
                }
            )
        } else {
            return formatMessageWithValues(
                intl, "payment", "PremiumsPayments",
                { count: pageInfo.totalCount }
            )
        }
    }

    rowDisabled = (i) => !!i && !!i.validityTo
    rowLocked = (i) => !!i && !!i.clientMutationId

    render() {
        const {
            intl,
            classes,
            family,
            premiumsPayments,
            pageInfo,
            readOnly,
            premium,
            rights,
            fetchingPremiumsPayments,
        } = this.props;
        if (!family.uuid) return null;
        const canAdd = rights.includes(RIGHT_PAYMENT_ADD);
        let actions = [
            {
                button: <IconButton onClick={this.query}><ReplayIcon /></IconButton>,
                tooltip: formatMessage(intl, "contribution", "reload.tooltip")
            }
        ];
        if (!!!readOnly && canAdd) {
            actions.push(
                {
                    button: <IconButton className={!premium ? classes.disabled : ""} onClick={this.addNewPayment}><AddIcon /></IconButton>,
                    tooltip: !premium ?
                        formatMessage(intl, "payment", "addNewPayment.tooltip.selectPremium") :
                        formatMessage(intl, "payment", "addNewPayment.tooltip")
                }
            )
        }

        return (
            <>
                <DeletePaymentDialog
                    payment={this.state.deletePayment}
                    onConfirm={() => this.deletePayment()}
                    onCancel={e => this.setState({ deletePayment: null })} />
                <Paper className={classes.paper}>
                    <Grid container alignItems="center" direction="row" className={classes.paperHeader}>
                        <Grid item xs={8}>
                            <Typography className={classes.tableTitle}>
                                {this.header()}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Grid container direction="row" justify="flex-end">
                                {actions.map((a, idx) => {
                                    return (
                                        <Grid item key={`form-action-${idx}`} className={classes.paperHeaderAction}>
                                            {withTooltip(a.button, a.tooltip)}
                                        </Grid>
                                    )
                                })}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Table
                        fetching={fetchingPremiumsPayments}
                        module="payment"
                        headerActions={this.headerActions}
                        headers={this.headers}
                        itemFormatters={this.itemFormatters()}
                        items={premiumsPayments || []}
                        withPagination={true}
                        onDoubleClick={this.onDoubleClick}
                        rowsPerPageOptions={this.rowsPerPageOptions}
                        defaultPageSize={this.defaultPageSize}
                        page={this.currentPage()}
                        pageSize={this.currentPageSize()}
                        count={pageInfo.totalCount}
                        onChangePage={this.onChangePage}
                        onChangeRowsPerPage={this.onChangeRowsPerPage}
                        rowDisabled={i => this.rowDisabled(i)}
                        rowLocked={i => this.rowLocked(i)}
                    />
                </Paper>
            </>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    family: state.insuree.family || {},
    premium: state.contribution.premium,
    policiesPremiums: state.contribution.policiesPremiums,
    fetchingPremiumsPayments: state.payment.fetchingPremiumsPayment,
    fetchedPremiumsPayments: state.payment.fetchedPremiumsPayment,
    premiumsPayments: state.payment.premiumsPayments,
    pageInfo: state.payment.premiumsPaymentsPageInfo,
    errorPremiumsPayment: state.payment.errorPremiumsPayment,
    submittingMutation: state.payment.submittingMutation,
    mutation: state.payment.mutation,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        fetch: fetchPremiumsPayments,
        deletePayment,
        journalize,
    }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PremiumsPaymentsOverview)))));