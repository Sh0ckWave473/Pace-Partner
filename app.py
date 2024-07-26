import sys
import pandas as pd

def time_to_seconds(time):
    if type(time) == int:
        return time
    
    arr = time.split(":")
    
    if len(arr) == 3:
        h, m, s = map(int, arr)
        return h * 3600 + m * 60 + s
    elif len(arr) == 2:
        m, s = map(int, arr)
        return m * 60 + s
    else:
        return arr[0]

def quarterMile_to_milePace(seconds):
    timeInSeconds = int(seconds)
    timeInSeconds *= 1609.34
    timeInSeconds /= 400
    seconds = timeInSeconds % 60
    minutes = timeInSeconds // 60
    seconds = int(seconds)
    minutes = int(minutes)
    if(seconds < 10):
        return str(minutes) + ":0" + str(seconds)
    else:
        return str(minutes) + ":" + str(seconds)

def read_csv(file_path, distance, time, vO2):
    df = pd.read_csv(file_path)
    df_seconds = df.map(time_to_seconds)
    if(vO2 != 0):
        closest_index = (df_seconds["VDOT"] - vO2).abs().idxmin()
    else:
        time = int(time)
        closest_index = (df_seconds[distance] - time).abs().idxmin()
    vDOT = df.loc[closest_index, "VDOT"]
    ePMile = df.loc[closest_index, "EP mile"]
    mPMile = df.loc[closest_index, "MP mile"]
    tPMile = df.loc[closest_index, "T mile"]
    iP400 = df.loc[closest_index, "I 400"]
    iP400 = quarterMile_to_milePace(iP400)
    rP400 = df.loc[closest_index, "R 400"]
    rP400 = quarterMile_to_milePace(rP400)
    pr1500 = df.loc[closest_index, "1500m"]
    prMile = df.loc[closest_index, "1 mile"]
    pr3000 = df.loc[closest_index, "3k"]
    pr2Mile = df.loc[closest_index, "2 mile"]
    pr5000 = df.loc[closest_index, "5k"]
    pr10000 = df.loc[closest_index, "10k"]
    prHalf = df.loc[closest_index, "Half-Marathon"]
    prMarathon = df.loc[closest_index, "Marathon"]
    return vDOT, ePMile, mPMile, tPMile, iP400, rP400, pr1500, prMile, pr3000, pr2Mile, pr5000, pr10000, prHalf, prMarathon

if __name__ == "__main__":
    file_path = sys.argv[1]
    distance = sys.argv[2]
    time = sys.argv[3]
    if(len(sys.argv) == 5):
        vO2 = int(sys.argv[4])
    else:
        vO2 = 0
    vDOT, ePMile, mPMile, tPMile, iP400, rP400, pr1500, prMile, pr3000, pr2Mile, pr5000, pr10000, prHalf, prMarathon = read_csv(file_path, distance, time, vO2)
    print(vDOT, ePMile, mPMile, tPMile, iP400, rP400, pr1500, prMile, pr3000, pr2Mile, pr5000, pr10000, prHalf, prMarathon)