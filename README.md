# Changes

This is fork to target this screenshotter for rendering to an Inkplate6color and Inkplate10

---

# Home Assistant Lovelace dashboard renderer for Inkplate

![ci](https://github.com/brodykenrick/hass-lovelace-dashboard-inkplate-screenshotter/actions/workflows/publish.yml/badge.svg)

This tool can be used as Home Assistant addon to display a Lovelace view of your Home Assistant instance as an image. So it can be displayed on the eink panel, like Inkplate6color, or any screen connected to the network. It regularly takes a screenshot which can be polled.

## Sample image

![Sample image](https://raw.githubusercontent.com/brodykenrickkocus/hass-lovelace-dashboard-inkplate-screenshotter/main/assets/sample.png)

## Features

This tool regularly takes a screenshot of a specific page of your home assistant setup. It converts it into the PNG with various options.

## Usage

Go to the Home Assistant options, addons, addon store, then using upper right menu add this repository. Then you should be able to install the addon using the install button on this page.

After instaling go to the addon config and (minimally) setup two options:
- ha_base_url - base url of your home assistant instance (http://192.168.0.2:8123 for example)
- ha_access_token - go to your user profile and the bottom you will have an option to generate access token. Paste it there.

You can access the image by doing a simple GET request to e.g. `http://localhost:5006/` to receive the most recent image for page 1. you can also request to `http://localhost:5006/1.png` or `http://localhost:5006/2.png` or `http://localhost:5006/name.png`

General options as below:

| Option                    | Sample value                          | Description                                                                                                                                             |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ha_base_url`             | `https://your-hass-instance.com:8123` | Base URL of your home assistant instance                                                                                                                |
| `ha_access_token`         | `eyJ0...`                             | Long-lived access token from Home Assistant, see [official docs](https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token)           |
| `language`                | `en`                                  | Language to set in browser and home assistant                                                                                                           |
| `cron_job`                | `* * * * *`                           | How often to take screenshot                                                                                                                            |
| `rendering_timeout`       | `10000`                               | Timeout of render process, helpful if your HASS instance might be down                                                                                  |
| `rendering_delay`         | `0`                                   | how long to wait between navigating to the page and taking the screenshot, in milliseconds                                                              |
| `log_level`               | `info`                                | Log at level                                                                                                                                            |

Pages (one or more) options as below:

| Option                    | Sample value                          | Description                                                                                                                                             |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`                    | `/lovelace?kiosk`                     | Relative URL to take screenshot of (btw, the `?kiosk` parameter hides the nav bar using the [kiosk mode](https://github.com/maykar/kiosk-mode) project) |
| `name`                    | `weather_inkplate6color`              | name that will be used for accessing this page from teh webserver                                                                                       |
| `config`                  | `inkplate6color`                      | Config setting by identifying the type of the inkplate inkplate6color or inkplate10                                                                     |
| `rotation`                | `0`                                   | Rotation of image in degrees, e.g. use 90 or 270 to render in landscape                                                                                 |

### Advanced configuration

You can change the port used by the addon using the configuration screen.
