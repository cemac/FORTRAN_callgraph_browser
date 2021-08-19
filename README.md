# FORTRAN_callgraph_browser 
[![DOI](https://zenodo.org/badge/390411763.svg)](https://zenodo.org/badge/latestdoi/390411763)

A browsing tool that reads in a directory of fortran code and displays it as an interactive graph. 
 
#### Summary 
https://www.cemac.leeds.ac.uk/home/project-summaries/fortran-code-browser/
 
## Quickstart
The app works for all of the three main operating system. 

### Install
The first step is installing it on your device - this does not require any admin privileges. 
#### Mac
Use the `.dmg` file. 
Drag the file shown to your desired folder - NOT the applications folder (see below for why).
#### Windows
Use the `.exe` file. 
#### Linux
Use the `.AppImage` file. 

### Run
When running, the app looks for a file named 






## Code generation: 
The code generator program can be executed by 

```bash 
python -m processing
```

### code generation program arguments
The arguments can be viewed by supplying the `--help` keyword to the run. 

```python
usage: __main__.py [-h] [-p PATH] [-n [DESCRIPTION]] [-s [SKIP]]

A script to parse fortran source code and generate a callgraph. Author: Daniel
Ellis Organisation: CEMAC, University of Leeds Dependancies: - fparser2 -
python 3 - pandas Usage: python -m processing -p
/Users/wolfiex/UMTools/UMspyder/vn11.7/src/atmosphere/UKCA or for IPython run
-m processing -p /Users/wolfiex/UMTools/UMspyder/vn11.7/src/atmosphere/UKCA

optional arguments:
  -h, --help            show this help message and exit
  -p PATH, --path PATH  location of fortran source code
  -n [DESCRIPTION], --desc [DESCRIPTION]
                        location of fortran source code
  -s [SKIP], --skip [SKIP]
                        which routine names to skip separated by a space.
```

### Requirements

```pip3 install fparser pandas tqdm```

## Rebuilding the APP
To rebuild the app we need to package it. The process is described below:
1. Navigate to the `src` directory
2. Install the prerequisites: `npm i`
3. Run the builder: `./node_modules/electron-builder/out/cli/cli.js`

4. Generate for other systems. The following script may help for this:
```bash 
./node_modules/electron-builder/out/cli/cli.js --win;

./node_modules/electron-builder/out/cli/cli.js --linux;

./node_modules/electron-builder/out/cli/cli.js --mac;


# then copy the files to the main repo
mv ./dist/*.dmg ../
mv ./dist/*.exe ../
mv ./dist/*.AppImage ../


```
This uses the builder config file and generates a file for each operating system. Make sure that the dependancies for building on each are met before doing this. Windows sometimes requires some additional files if being built from Linux or Mac. 

Once built, the programs are located within the `src/dist` directory. There should be one for each of the three operating systems. 

** It is worth noting that the build folder is not saved by github as some of the app files are >100mb. Instead the zipped versons of each one have been copied to the root directory of this page. 
