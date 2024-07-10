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

def read_csv(file_path, distance, time):
    time = int(time)
    df = pd.read_csv(file_path)
    df_seconds = df.map(time_to_seconds)
    closest_index = (df_seconds[distance] - time).abs().idxmin()
    vDOT = df.loc[closest_index, "VDOT"]
    ePMile = df.loc[closest_index, "EP mile"]
    mPMile = df.loc[closest_index, "MP mile"]
    tPMile = df.loc[closest_index, "T mile"]
    iP400 = df.loc[closest_index, "I 400"]
    rP400 = df.loc[closest_index, "R 400"]
    return vDOT, ePMile, mPMile, tPMile, iP400, rP400

if __name__ == "__main__":
    file_path = sys.argv[1]
    distance = sys.argv[2]
    time = sys.argv[3]
    vDOT, ePMile, mPMile, tPMile, iP400, rP400 = read_csv(file_path, distance, time)
    print(vDOT, ePMile, mPMile, tPMile, iP400, rP400)