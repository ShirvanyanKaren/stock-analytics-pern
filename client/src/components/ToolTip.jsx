import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';


const ToolTip = (props) => {


const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        maxWidth: 400,
        fontSize: theme.typography.pxToRem(12),
        position: 'relative',
        border: '1px solid #dadde9',
    },
    }));
    const returnInfo = {
     smlInfo:  "SMB Beta: The sensitivity of a portfolio's excess returns to the returns of the SMB factor. A beta of 1.0 indicates perfect correlation to the factor, 0.0 indicates no correlation, and negative values indicate an inverse correlation.",
     hmlInfo:  "HML Beta: The sensitivity of a portfolio's excess returns to the returns of the HML factor. A beta of 1.0 indicates perfect correlation to the factor, 0.0 indicates no correlation, and negative values indicate an inverse correlation.",
     mktRfInfo: "Portfolio Beta: The sensitivity of a portfolio's excess returns to the returns of the Mkt-Rf factor. A beta of 1.0 indicates perfect correlation to the factor, 0.0 indicates no correlation, and negative values indicate an inverse correlation.",
     smlPvalInfo: "SMB P-Value: The probability of observing a value as extreme or more extreme than the observed value by chance, assuming the null hypothesis is true. A p-value of 0.05 or less is considered statistically significant.",
     hmlPvalInfo: "HML P-Value: The probability of observing a value as extreme or more extreme than the observed value by chance, assuming the null hypothesis is true. A p-value of 0.05 or less is considered statistically significant.",
     mktRfPvalInfo: "Portfolio P-Value: The probability of observing a value as extreme or more extreme than the observed value by chance, assuming the null hypothesis is true. A p-value of 0.05 or less is considered statistically significant.",
     rSquaredInfo:  "R-Squared: The percentage of a portfolio's excess returns that can be explained by the returns of the SMB and HML factors. A value of 1.0 indicates perfect correlation, 0.0 indicates no correlation, and negative values indicate an inverse correlation.",
     sharpeRatioInfo: "Sharpe Ratio: The average return earned in excess of the risk-free rate per unit of volatility or total risk. A higher Sharpe ratio indicates a better historical risk-adjusted performance."
    }


    console.log(props.info)


    const checkInfoSource = () => {
        // check on hover what info is being requested and return the appropriate info


        if(props.info === "SMB"){
            return returnInfo.smlInfo;
        } else if (props.info === "HML"){
            return returnInfo.hmlInfo;
        } else if (props.info === "Mkt-Rf"){
            return returnInfo.mktRfInfo;
        } else if (props.info === "SMB P-Value"){
            return returnInfo.smlPvalInfo;
        } else if (props.info === "HML P-Value"){
            return returnInfo.hmlPvalInfo;
        } else if (props.info === "Mkt-Rf P-Value"){
            return returnInfo.mktRfPvalInfo;
        } else if (props.info === "R-Squared"){
            return returnInfo.rSquaredInfo;
        } else if (props.info === "Sharpe Ratio"){
            return returnInfo.sharpeRatioInfo;
        }
    }

    return (
        <HtmlTooltip
        title={
            <React.Fragment>
            <Typography 
            style={{ color: 'white', fontSize: '24px' }}
            color="inherit">
                {props.info}</Typography>
            <em
                style={{ color: 'white', fontSize: '20px' }}
                dangerouslySetInnerHTML={{ __html: checkInfoSource() }

                }
            />
            </React.Fragment>
        }
        >
        <li className="list-group-item">
            {props.text}
        </li>
        </HtmlTooltip>
    );
    }

export default ToolTip;