import Button from "./button.js";

// ID of the car BlueTooth service. 
const service_uuid = '000000ff-0000-1000-8000-00805f9b34fb';
const characteristic_uuid = '0000ff01-0000-1000-8000-00805f9b34fb';

// User visible terminal.
let html_terminal = null;

// User visible temperature display.
// Used to display the chip temperature.
let html_temperature = null;

// Virtual joysticks.
// let joy_test_2d_1 = null;
// let joy_test_2d_2 = null;
// let joy_test_1d_1 = null;
let joy_1d_direction = null;
let joy_1d_speed = null;

// Is a real joystick connected?
let remote_controller_enabled = false;

// BlueTooth webapi handle.
let car_ble_characteristic = null;

// Last time the chip  temperature was quieried.
let last_update_temperature_timestamp = null;

// Logs a text in the user visible terminal.
function log(text) {
    if (html_terminal !== null) {
        html_terminal.innerHTML = text + "\n" + html_terminal.innerHTML;
    }
    console.log(text);
}

// Redirect errors into the user visible terminal.
window.onerror = function (message, url, line, col) {
    log(`Error: ${message}\nURL: ${url}\nLine: ${line}, Col: ${col}`);
    return true;
};

// Redirect errors into the user visible terminal.
window.addEventListener('unhandledrejection', (event) => {
    log(event.reason);
});

window.onload = function () {
    html_terminal = document.getElementById("terminal");
    html_temperature = document.getElementById("temperature");

    const config_button = function (id, callback) {
        document.getElementById(id).addEventListener("click", callback);
    }

    config_button("button_test", button_connect);
    config_button("button_fullscreen", button_fullscreen);
    config_button("button_xbox_controller", button_xbox_controller);

    // joy_test_2d_1 = new Button.Joystick2D(document.getElementById("joy_test_2d_1"));
    // joy_test_2d_2 = new Button.Joystick2D(document.getElementById("joy_test_2d_2"));
    joy_1d_direction = new Button.Joystick1DHorizontal(document.getElementById("joy_1d_direction"));
    joy_1d_speed = new Button.Joystick1D(document.getElementById("joy_1d_speed"));

    log("page loaded");

    ui_tick();
    ble_tick();
}

window.addEventListener("gamepadconnected", (e) => {
    log(`controller #${e.gamepad.index} connected`);
});
window.addEventListener("gamepaddisconnected", (e) => {
    log(`controller #${e.gamepad.index} disconnected`);
});


// End of hooks.

async function update_temperature() {
    let temperature = "NA";
    if (car_ble_characteristic !== null) {
        const temperature_int16 = await car_ble_characteristic.readValue();
        temperature = temperature_int16.getInt16(0, true);
    }
    html_temperature.innerHTML = `${temperature}°C`;
}

function debug_print_buttons(gamepad) {
    for (let button_idx = 0; button_idx < gamepad.buttons.length; button_idx++) {
        console.log(`${button_idx}: ${gamepad.buttons[button_idx].value}`);
    }
}

async function ble_tick() {
    if (last_update_temperature_timestamp == null ||
        Date.now() - last_update_temperature_timestamp > 2000) {
        await update_temperature();
        last_update_temperature_timestamp = Date.now();
    }

    // control car
    if (car_ble_characteristic !== null) {
        const direction = joy_1d_direction.av;
        const speed = joy_1d_speed.av;

        const packet = new Uint8Array(5);
        const view = new DataView(packet.buffer);
        view.setUint8(0, 0x01);
        view.setInt16(1, floatm11_to_int16(direction / 1000), true);
        view.setInt16(3, floatm11_to_int16(speed), true);
        // console.log("packet:", packet);
        try {
            await car_ble_characteristic.writeValueWithResponse(packet);
        } catch (error) {
            log(error);
        }
        // console.log("update sent");
    }

    setTimeout(ble_tick, 20);
}

async function ui_tick() {
    // External joystick
    const gamepad = navigator.getGamepads()[0];
    if (remote_controller_enabled && gamepad !== null) {
        // debug_print_buttons(gamepad);
        // joy_test_2d_1.set_pos(gamepad.axes[0], gamepad.axes[1]);
        // joy_test_2d_2.set_pos(gamepad.axes[2], gamepad.axes[3]);
        // joy_test_1d_1.set_pos(gamepad.buttons[7].value - gamepad.buttons[6].value);
        joy_1d_direction.set_pos(gamepad.axes[0]);
        joy_1d_speed.set_pos(gamepad.buttons[6].value - gamepad.buttons[7].value);
    }

    // joystick motion
    // joy_test_2d_1.tick();
    // joy_test_2d_2.tick();
    // joy_test_1d_1.tick();
    joy_1d_direction.tick();
    joy_1d_speed.tick();

    setTimeout(ui_tick, 20);
}

function floatm11_to_int16(av) {
    const av_int = Button.clamp(av, -1, 1) * 0x7FFF;
    return Math.trunc(av_int);
}

function button_xbox_controller() {
    log("toggle xbox controller");
    remote_controller_enabled ^= true;
}

function button_fullscreen() {
    log("toggle fullscreen");
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}

async function button_connect() {
    log("Looking for car");
    const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'MiniCar' }],
        optionalServices: [service_uuid]
    });

    log("Connecting to car");
    const deviceServer = await device.gatt.connect();

    console.log("Configure service");
    const service = await deviceServer.getPrimaryService(service_uuid);

    console.log("Configure characteristic");
    car_ble_characteristic = await service.getCharacteristic(characteristic_uuid);

    log("Connected")
}
