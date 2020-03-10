import React, {useState} from 'react';
import Dialog from '@material-ui/core/Dialog';
import Search from './Search'
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';


const SearchDialog = (props) => {
    const { onClose, open } = props;

    const handleClose = () => {
        onClose();
    };


    return (
        <Dialog fullWidth onClose={handleClose} open={open}>
            <DialogContent>
                <Search onSearchDialogClose={handleClose} autoFocus/>
            </DialogContent>           
        </Dialog>
    );
}

const SearchIconButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    return(
        <div>
            <IconButton onClick={() => setIsOpen(true) }>
                <SearchIcon style={{ width: 30, height: 30, color: "white"}} />
            </IconButton>
            <SearchDialog open={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    )
}

export default SearchIconButton