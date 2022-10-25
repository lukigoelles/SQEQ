# SQEQ
Software for transforming REW [1] Auto-EQ to Allen & Heath SQ GEQ.

### Software Requirements 
The following software has to be installed:
- Room Equalization Wizard [1]
- node.js [2]

### Manual
- Make sure that your PC and your SQ are in the same network.
- Perform impulse response measurement by REW [1] and use the Auto-EQ wizard on the third-octave smoothed rms-averaged frequency response.
- Export filter settings as *.txt* file.
- Modify the IP-adress of the host (SQ mixer) in *index.js* (line 10). (Hint: Use a static IP adress so that you have to change this only once!)
- Open the file *index.js* from the root folder with node.js (for **MacOS** users: navigate to the folder in your terminal and use *node .*). 
- Open the file *index.html* from the web folder with your web browser. 
- If a websocket connection has been established sucessfully, the light turns green, otherwise it stays red. The websocket connection is mandatory to communicate between browser and mixer! 
- Modify the settings:
    - IR length = FFT size: This parameters determines the length of the filter impulse response that can be downloaded afterwards. At the same time it sets the length of the Fast Fourier Transform for analysis. 
    - Sample Rate: This parameter is only relevant, if you whish to export the filter impulse reponse afterwards. 
- Import the REW *.txt* file. 
- Now you can send the GEQ values to any ouput of the SQ mixer by pressing the corresponding button.

### Licence
This sotware is released under [MIT](LICENSE) licence.<br>
Copyright &copy; Lukas Gölles, 2022

### References
[1] https://www.roomeqwizard.com/ <br>
[2] https://nodejs.org/en/