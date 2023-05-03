# `disable_gpu`

This is a small script I wrote to help me figure out which ACPI method was needed to disable the discrete GPU in a laptop.

**Disclaimer**: This comes with no warranty of any kind, etc. See the `acpi_call` notes for how this works under the hood.
I don't pretend to know how any of this works, I just wrote this script to help me find the method that worked for my GPU.

## Usage

Please note, these commands and the script need to run as root (or with `sudo`, etc).

First, make sure you've got `acpi_call` installed, and its module is loaded.
Depending on your distribution, it's something like `modprobe acpi_call` or `insmod acpi_call.ko`.

Then, run the script with a list of BIOS Device Names you want it to try out for you:

```bash
# this must be run as root
$ ./index.js "PC00.PEG1.PEGP"
```

If any of them worked, you'll see output that appears like this:

```txt
... truncated ...
Attempting: \_SB.PC00.PEG1.PEGP.XTPX...
Result: Error: AE_NOT_FOUND
Attempting: \_SB.PC00.PEG1.PEGP._OFF...
Result: Error: AE_NOT_FOUND
Attempting: \_SB.PC00.PEG1.PEGP._PS3...
Result: 0x0


SUCCESS WITH: \_SB.PC00.PEG1.PEGP._PS3

... truncated ...
```

And now you know which method will work for your device!

## How to know what BIOS Device Name to try?

* open the Device Manager (in Windows)
* find the GPU under "Display adapters"
* right click -> "Properties"
* select the "Details" tab
* change the "Property" value to "BIOS device name" or "Location paths"
* in the "Value" textarea you should see something that resembles a method call

It appears that the prefix doesn't really matter? For my GPU (RTX A1000) both `_SB` and `_SB_` worked.
This script tries both, so leave off the prefix when you pass it to this script (like the usage examples above).

