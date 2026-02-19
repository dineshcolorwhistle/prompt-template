export const pageVariants = {
    initial: {
        opacity: 0,
        x: -20
    },
    in: {
        opacity: 1,
        x: 0
    },
    out: {
        opacity: 0,
        x: 20
    }
};

export const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
};

export const modalVariants = {
    initial: {
        opacity: 0,
        scale: 0.95
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    }
};

export const overlayVariants = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.2
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2
        }
    }
};

export const dropdownVariants = {
    initial: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        display: "none"
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        display: "block",
        transition: {
            duration: 0.2
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: {
            duration: 0.15
        },
        transitionEnd: {
            display: "none"
        }
    }
};

export const toastVariants = {
    initial: {
        opacity: 0,
        y: -20,
        x: 20,
        scale: 0.9
    },
    animate: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: {
            duration: 0.2
        }
    }
};

export const listVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

export const buttonTap = {
    scale: 0.98
};

export const buttonHover = {
    y: -2,
    transition: { duration: 0.2 }
};
