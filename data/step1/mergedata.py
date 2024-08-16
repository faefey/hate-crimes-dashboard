import pandas as pd

# read hate crimes data and drop duplicate rows
data1 = pd.read_csv('NYPD_Hate_Crimes_20231201.csv').drop_duplicates(subset='Full Complaint ID')

# read precinct population data and drop duplicate column
data2 = pd.read_csv('nyc_precinct_2020pop.csv').drop('P2_001N', axis='columns')

# rename precinct population columns according to text file of column code/name pairs
f = open('columns.txt', 'r')
lines = f.readlines()
f.close()
d = {}
for i in lines:
    kv = i.split(',')
    d[kv[0][1:-1]] = kv[1].replace('!!', ' ')[3:-2]
data2 = data2.rename(columns=d)

# for the hate crimes data, rename column to be merged on to 'Precinct' and take subset of columns
data1 = data1.rename(columns={'Complaint Precinct Code': 'Precinct'})
data1 = data1[['Complaint Year Number',
               'Month Number',
               'Precinct',
               'Patrol Borough Name',
               'County',
               'Law Code Category Description',
               'Offense Description',
               'PD Code Description',
               'Bias Motive Description',
               'Offense Category']]

# for the precinct population data, rename column to be merged on to 'Precinct' and take subset of columns
data2 = data2.rename(columns={'precinct': 'Precinct'})
data2 = data2[['Precinct', 
               'Total: Population of one race: White alone', 
               'Total: Population of one race: Black or African American alone', 
               'Total: Population of one race: American Indian and Alaska Native alone', 
               'Total: Population of one race: Asian alone', 
               'Total: Population of one race: Native Hawaiian and Other Pacific Islander alone', 
               'Total: Population of one race: Some Other Race alone', 
               'Total: Not Hispanic or Latino: Population of one race: White alone',
               'Total: Not Hispanic or Latino: Population of one race: Black or African American alone',
               'Total: Not Hispanic or Latino: Population of one race: American Indian and Alaska Native alone',
               'Total: Not Hispanic or Latino: Population of one race: Asian alone',
               'Total: Not Hispanic or Latino: Population of one race: Native Hawaiian and Other Pacific Islander alone',
               'Total: Not Hispanic or Latino: Population of one race: Some Other Race alone',
               'Total: Hispanic or Latino']]

# simplify names of columns in the precinct population data
precincts1 = data2.iloc[:, 1:7].rename(columns=lambda x: x.replace('Total: Population of one race: ', ''))
precincts2 = data2.iloc[:, 7:].rename(columns=lambda x: x.replace('Total: ', '').replace('Population of one race: ', ''))

# export the race only population data and the race with ethnicity population data to two different csv files
precincts1.to_csv('../step2/precincts1.csv', encoding='utf-8', index=False)
precincts2.to_csv('../step2/precincts2.csv', encoding='utf-8', index=False)

# merge hate crimes data and precinct population data
output = pd.merge(data1, data2, on='Precinct', how='left')

# export merged data to csv file
output.to_csv('../step2/data.csv', encoding='utf-8', index=False)

print('Done!')