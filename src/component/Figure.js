import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Cancel';
import { DialogActions } from '@material-ui/core';

const FigureDialog = ({img, onClose, open}) => {

    const handleClose = () => {
        onClose();
    };

    const closeButtonBackground = {
        position: "absolute",
        right: 0,
        width: 50,
        height: 50,
        display: "flex",
        justifyContent: "center",
        backgroundColor: "rgb(0,0,0,0.2)",
        borderRadius: "0 0 0 50%",
    }

    return (
        <Dialog 
            onClose={handleClose}
            open={open} 
            PaperProps={{ style: { maxWidth: "90%", maxHeight: "80%"}}}
        >
            <div className="figure-dialog-img-container" style={{overflowY: "scroll"}}>
                {img}
            </div>
            <div style={closeButtonBackground}>
                <IconButton style={{ color: "white", position: "absolute" }} onClick={handleClose}>
                    <CloseIcon />
                </IconButton> 
            </div>
        </Dialog>
    );
}

FigureDialog.propTypes = {
};

const Figure = ({figure, img, caption}) => {
    const [open, setOpen] = React.useState(false);
    
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = value => {
        setOpen(false);
    };

    return (
        <div className="figure-container">
            <figure>
                <div onClick={handleClickOpen}>
                    {img}
                </div>
                {caption}
            </figure>
            <FigureDialog open={open} onClose={handleClose} img={img}/>
        </div>
    );
}

export default Figure;
