# Changes

This is fork to target this screenshotter for rendering to an Inkplate6color

---

# Home Assistant Lovelace dashboard renderer for Imkplate6color

![ci](https://github.com/brodykenrick/hass-lovelace-kindle-screensaver/actions/workflows/publish.yml/badge.svg)

This tool can be used as Home Assistant addon to display a Lovelace view of your Home Assistant instance as an image. So it can be displayed on the eink panel, like Inkplate6color, or any screen connected to the network. It regularly takes a screenshot which can be polled.

## Sample image

![Sample image](https://raw.githubusercontent.com/mbrodykenrickkocus/hass-lovelace-kindle-screensaver/main/assets/sample.png)

## Features

This tool regularly takes a screenshot of a specific page of your home assistant setup. It converts it into the PNG with various options.

## Usage

Go to the Home Assistant options, addons, addon store, then using upper right menu add this repository. Then you should be able to install the addon using the install button on this page.

After instaling go to the addon config and (minimally) setup two options:
- ha_base_url - base url of your home assistant instance (http://192.168.0.2:8123 for example)
- ha_access_token - go to your user profile and the bottom you will have an option to generate access token. Paste it there.

You can access the image by doing a simple GET request to e.g. `http://localhost:5006/` to receive the most recent image.

All options are the same as original addon and are listed below:

| Env Var                   | Sample value                          | Required | Array?\* | Description                                                                                                                                             |
| ------------------------- | ------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ha_base_url`             | `https://your-hass-instance.com:8123` | yes      | no       | Base URL of your home assistant instance                                                                                                                |
| `ha_screenshot_url`       | `/lovelace?kiosk`                     | no      | yes      | Relative URL to take screenshot of (btw, the `?kiosk` parameter hides the nav bar using the [kiosk mode](https://github.com/maykar/kiosk-mode) project) |
| `ha_access_token`         | `eyJ0...`                             | yes      | no       | Long-lived access token from Home Assistant, see [official docs](https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token)           |                                    |
| `language`                | `en`                                  | no       | no       | Language to set in browser and home assistant                                                                                                           |
| `cron_job`                | `* * * * *`                           | no       | no       | How often to take screenshot                                                                                                                            |
| `rendering_timeout`       | `10000`                               | no       | no       | Timeout of render process, helpful if your HASS instance might be down                                                                                  |
| `rendering_delay`         | `0`                                   | no       | yes      | how long to wait between navigating to the page and taking the screenshot, in milliseconds                                                              |
| `rendering_screen_width` | `800`                                 | no       | yes      | Height of your inkplate screen resolution                                                                                                                 |
| `rendering_screen_width`  | `600`                                 | no       | yes      | Width of your inkplate screen resolution                                                                                                                  |
| `rotation`                | `0`                                   | no       | yes      | Rotation of image in degrees, e.g. use 90 or 270 to render in landscape                                                                                 |
| `scaling`                 | `1`                                   | no       | yes      | Scaling factor, e.g. `1.5` to zoom in or `0.75` to zoom out                                                                                             |
| `grayscale_depth`         | `8`                                   | no       | yes      | Ggrayscale bit depth your inkplate supports                                                                                                               |
| `color_mode`              | `GrayScale`                           | no       | yes      | ColorMode to use, ex: `GrayScale`, or `TrueColor`.                                                                                                      |
| `dither`                  | `false`                               | no       | yes      | Apply a dither to the images.                                                                                                                           |

**\* Array** mode of original addon are **not currently supported**.

### Advanced configuration

You can change the port used by the addon using the configuration screen.