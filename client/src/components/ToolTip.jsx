import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { returnInfo } from '../utils/helpers';

const ToolTip = (props) => {
    const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(
        ({ theme }) => ({
            [`& .${tooltipClasses.tooltip}`]: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: '#fff',
                maxWidth: 220,
                fontSize: theme.typography.pxToRem(20),
                border: '1px solid #dadde9',
                borderRadius: '4px',
                padding: '8px',
            },
        }),
    );
    const checkInfoSource = () => {
        return returnInfo[props.info];
    };

    return (
        <HtmlTooltip
            title={
                <React.Fragment>
                    <Typography variant='body2' component='span'>
                        {checkInfoSource()}
                    </Typography>
                </React.Fragment>
            }>
            {props.text ? (
                <span className='float-end fw-bold stock-details-info'>{`${props.info}: ${props.text}`}</span>
            ) : (
                <span>{props.info}</span>
            )}
        </HtmlTooltip>
    );
};

export default ToolTip;
