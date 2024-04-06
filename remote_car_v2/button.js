
class Joystick1D {
    constructor(joystick) {
        this.joystick = joystick;
        this.nub = joystick.querySelector('.nub');

        this.joy_border = parseFloat(window.getComputedStyle(this.joystick)["border-left-width"]);
        this.margin = this.nub.offsetWidth / 2;

        // How fast to return to (0, 0) position when joy is released.
        this.return_speed = 0.10;

        this.start_drag_mouse = 0;
        this.start_drag_nub = 0;

        // Nub pressed by the user.
        this.pressed = false;

        joystick.addEventListener('touchstart', (event) => this.startDrag(event), false);
        joystick.addEventListener('touchmove', (event) => this.moveDrag(event), false);
        joystick.addEventListener('touchend', () => this.endDrag(), false);

        // Current position in (-1, 1) range for both axes.
        this.av = 0;
        this.set_pos(0);
    }


    tick() {
        if (this.pressed) { return; }
        let av = this.av;
        if (av < 0) {
            av = Math.min(0, av + this.return_speed);
        }
        if (av > 0) {
            av = Math.max(0, av - this.return_speed);
        }
        this.set_pos(av);
    }

    startDrag(event) {
        this.start_drag_mouse = event.targetTouches[0].clientY;
        this.start_drag_nub = this.nub.offsetTop
        this.pressed = true;
        event.preventDefault();
    }

    endDrag() {
        this.pressed = false;
    }

    moveDrag(event) {
        // New position in px
        let new_nub = this.start_drag_nub + event.targetTouches[0].clientY - this.start_drag_mouse;

        // Limite range
        new_nub = clamp(new_nub, this.margin, this.joystick.offsetHeight - this.margin - this.joy_border * 2);

        // Move nub
        this.nub.style.top = `${new_nub}px`;

        // (0, 1) range
        const av_01 = (new_nub - this.margin) / (this.joystick.offsetHeight - this.margin * 2 - this.joy_border * 2);

        // (-1, 1) range
        this.av = (av_01 - 0.5) * 2;
    }

    set_pos(av) {
        if (av == this.av) { return; }
        this.av = av;
        const new_nub = (this.av / 2 + 0.5) * (this.joystick.offsetHeight - this.margin * 2 - this.joy_border * 2) + this.margin;
        this.nub.style.top = `${new_nub}px`;
    }

}

class Joystick1DHorizontal {
    constructor(joystick) {
        this.joystick = joystick;
        this.nub = joystick.querySelector('.nub');

        this.joy_border = parseFloat(window.getComputedStyle(this.joystick)["border-left-width"]);
        this.margin = this.nub.offsetHeight / 2;

        // How fast to return to (0, 0) position when joy is released.
        this.return_speed = 0.10;

        this.start_drag_mouse = 0;
        this.start_drag_nub = 0;

        // Nub pressed by the user.
        this.pressed = false;

        joystick.addEventListener('touchstart', (event) => this.startDrag(event), false);
        joystick.addEventListener('touchmove', (event) => this.moveDrag(event), false);
        joystick.addEventListener('touchend', () => this.endDrag(), false);

        // Current position in (-1, 1) range for both axes.
        this.av = 0;
        this.set_pos(0);
    }


    tick() {
        if (this.pressed) { return; }
        let av = this.av;
        if (av < 0) {
            av = Math.min(0, av + this.return_speed);
        }
        if (av > 0) {
            av = Math.max(0, av - this.return_speed);
        }
        this.set_pos(av);
    }

    startDrag(event) {
        this.start_drag_mouse = event.targetTouches[0].clientX;
        this.start_drag_nub = this.nub.offsetLeft
        this.pressed = true;
        event.preventDefault();
    }

    endDrag() {
        this.pressed = false;
    }

    moveDrag(event) {
        // New position in px
        let new_nub = this.start_drag_nub + event.targetTouches[0].clientX - this.start_drag_mouse;

        // Limite range
        new_nub = clamp(new_nub, this.margin, this.joystick.offsetWidth - this.margin - this.joy_border * 2);

        // Move nub
        this.nub.style.left = `${new_nub}px`;

        // (0, 1) range
        const av_01 = (new_nub - this.margin) / (this.joystick.offsetWidth - this.margin * 2 - this.joy_border * 2);

        // (-1, 1) range
        this.av = (av_01 - 0.5) * 2;
    }

    set_pos(av) {
        if (av == this.av) { return; }
        this.av = av;
        const new_nub = (this.av / 2 + 0.5) * (this.joystick.offsetWidth - this.margin * 2 - this.joy_border * 2) + this.margin;
        this.nub.style.left = `${new_nub}px`;
    }

}

class Joystick2D {
    constructor(joystick) {
        this.joystick = joystick;
        this.nub = joystick.querySelector('.nub');

        this.joy_border = parseFloat(window.getComputedStyle(this.joystick)["border-left-width"]);
        this.margin = this.nub.offsetWidth / 2;

        // How fast to return to (0, 0) position when joy is released.
        this.return_speed = 0.10;

        this.start_drag_mouse_x = 0;
        this.start_drag_mouse_y = 0;
        this.start_drag_nub_x = 0;
        this.start_drag_nub_y = 0;

        // Nub pressed by the user.
        this.pressed = false;

        joystick.addEventListener('touchstart', (event) => this.startDrag(event), false);
        joystick.addEventListener('touchmove', (event) => this.moveDrag(event), false);
        joystick.addEventListener('touchend', () => this.endDrag(), false);

        // Current position in (-1, 1) range for both axes.
        this.av_x = 0;
        this.av_y = 0;
        this.set_pos(0, 0);
    }


    tick() {
        if (this.pressed) { return; }
        let av_x = this.av_x;
        let av_y = this.av_y;
        if (av_x < 0) {
            av_x = Math.min(0, av_x + this.return_speed);
        }
        if (av_x > 0) {
            av_x = Math.max(0, av_x - this.return_speed);
        }
        if (av_y < 0) {
            av_y = Math.min(0, av_y + this.return_speed);
        }
        if (av_y > 0) {
            av_y = Math.max(0, av_y - this.return_speed);
        }
        this.set_pos(av_x, av_y);
    }

    startDrag(event) {
        this.start_drag_mouse_x = event.targetTouches[0].clientX;
        this.start_drag_mouse_y = event.targetTouches[0].clientY;
        this.start_drag_nub_x = this.nub.offsetLeft;
        this.start_drag_nub_y = this.nub.offsetTop
        this.pressed = true;
        event.preventDefault();
    }

    endDrag() {
        this.pressed = false;
    }

    moveDrag(event) {
        // New position in px
        let new_nub_x = this.start_drag_nub_x + event.targetTouches[0].clientX - this.start_drag_mouse_x;
        let new_nub_y = this.start_drag_nub_y + event.targetTouches[0].clientY - this.start_drag_mouse_y;


        // Limite range
        new_nub_x = clamp(new_nub_x, this.margin, this.joystick.offsetWidth - this.margin - this.joy_border * 2);
        new_nub_y = clamp(new_nub_y, this.margin, this.joystick.offsetHeight - this.margin - this.joy_border * 2);

        // Move nub
        this.nub.style.left = `${new_nub_x}px`;
        this.nub.style.top = `${new_nub_y}px`;

        // (0, 1) range
        const av_x_01 = (new_nub_x - this.margin) / (this.joystick.offsetWidth - this.margin * 2 - this.joy_border * 2);
        const av_y_01 = (new_nub_y - this.margin) / (this.joystick.offsetHeight - this.margin * 2 - this.joy_border * 2);

        // (-1, 1) range
        this.av_x = (av_x_01 - 0.5) * 2;
        this.av_y = (av_y_01 - 0.5) * 2;
    }

    set_pos(av_x, av_y) {
        if (av_x == this.av_x && av_y == this.av_y) { return; }

        this.av_x = av_x;
        this.av_y = av_y;

        const new_nub_x = (this.av_x / 2 + 0.5) * (this.joystick.offsetWidth - this.margin * 2 - this.joy_border * 2) + this.margin;
        const new_nub_y = (this.av_y / 2 + 0.5) * (this.joystick.offsetHeight - this.margin * 2 - this.joy_border * 2) + this.margin;

        this.nub.style.left = `${new_nub_x}px`;
        this.nub.style.top = `${new_nub_y}px`;
    }

}

function clamp(value, min_value, max_value) {
    return Math.min(Math.max(value, min_value), max_value);
}

export default {
    Joystick2D,
    Joystick1D,
    Joystick1DHorizontal ,
    clamp,
};
