import React from "react";

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    letterSpacing: 1.25,
    fontWeight: "bold",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
    },
  },
  droppable: {
    marginRight: theme.spacing(1),
  },
  menuItem: {
    padding: theme.spacing(1),
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(2),
    },
  },
}));

export default function NavigationBar() {
  const classes = useStyles();
  const [activePage, setActivePage] = React.useState("mottery");
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container className={classes.root}>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <Box className={classes.menu}>
            <IconButton 
              aria-controls="mottery-menu"
              aria-haspopup="true"
              className={classes.droppable}
              color="inherit"
              component="button"
              onClick={handleClick}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              id="mottery-menu"
              onClose={handleClose}
              open={Boolean(anchorEl)}
            >
              <MenuItem>Tickets</MenuItem>
              <MenuItem>Wallets</MenuItem>
            </Menu>

            <Link
              className={classes.title}
              color={activePage === "mottery" ? "black" : "inherit"}
              component="button"
              noWrap
              onClick={() => setActivePage("mottery")}
              variant="h4"
            >
              ๓๏ՇՇєгץ
            </Link>
          </Box>

          <Box className={classes.menu}>
            {["about", "contact"].map(item => (
              <Link
                className={classes.menuItem}
                color={activePage === item ? "black" : "inherit"}
                component="button"
                onClick={() => setActivePage(item)}
                variant="body2"
              >
                {item.toUpperCase()}
              </Link>
            ))}

            <Link
              className={classes.menuItem}
              color="inherit"
              component="button"
              variant="body2"
            >
              TELEGRAM
            </Link>
            <Link
              className={classes.menuItem}
              color="inherit"
              component="button"
              variant="body2"
            >
              ETHERSCAN
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
    </Container>
  )
}