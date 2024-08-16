import json
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

print('Applying PCA to the data...')

# define columns of interest and corresponding labels for race only population data
columns1 = ['Total: Population of one race: White alone',
              'Total: Population of one race: Black or African American alone',
              'Total: Population of one race: American Indian and Alaska Native alone',
              'Total: Population of one race: Asian alone',
              'Total: Population of one race: Native Hawaiian and Other Pacific Islander alone',
              'Total: Population of one race: Some Other Race alone']
labels1 = ['White alone',
           'Black or African American alone',
           'American Indian and Alaska Native alone',
           'Asian alone',
           'Native Hawaiian and Other Pacific Islander alone',
           'Some Other Race alone']

# define columns of interest and corresponding labels for race with ethnicity population data
columns2 = ['Total: Not Hispanic or Latino: Population of one race: White alone',
              'Total: Not Hispanic or Latino: Population of one race: Black or African American alone',
              'Total: Not Hispanic or Latino: Population of one race: American Indian and Alaska Native alone',
              'Total: Not Hispanic or Latino: Population of one race: Asian alone',
              'Total: Not Hispanic or Latino: Population of one race: Native Hawaiian and Other Pacific Islander alone',
              'Total: Not Hispanic or Latino: Population of one race: Some Other Race alone',
              'Total: Hispanic or Latino']
labels2 = ['Not Hispanic or Latino: White alone',
           'Not Hispanic or Latino: Black or African American alone',
           'Not Hispanic or Latino: American Indian and Alaska Native alone',
           'Not Hispanic or Latino: Asian alone',
           'Not Hispanic or Latino: Native Hawaiian and Other Pacific Islander alone',
           'Not Hispanic or Latino: Some Other Race alone',
           'Hispanic or Latino']

# define labels for precincts
precinct_labels = ['1st Precinct', '5th Precinct', '6th Precinct', '7th Precinct', '9th Precinct', '10th Precinct', '13th Precinct', 'Midtown South Precinct', '17th Precinct', 'Midtown North Precinct', '19th Precinct', '20th Precinct', 'Central Park Precinct', '23rd Precinct', '24th Precinct', '25th Precinct', '26th Precinct', '28th Precinct', '30th Precinct', '32nd Precinct', '33rd Precinct', '34th Precinct', '40th Precinct', '41st Precinct', '42nd Precinct', '43rd Precinct', '44th Precinct', '45th Precinct', '46th Precinct', '47th Precinct', '48th Precinct', '49th Precinct', '50th Precinct', '52nd Precinct', '60th Precinct', '61st Precinct', '62nd Precinct', '63rd Precinct', '66th Precinct', '67th Precinct', '68th Precinct', '69th Precinct', '70th Precinct', '71st Precinct', '72nd Precinct', '73rd Precinct', '75th Precinct', '76th Precinct', '77th Precinct', '78th Precinct', '79th Precinct', '81st Precinct', '83rd Precinct', '84th Precinct', '88th Precinct', '90th Precinct', '94th Precinct', '100th Precinct', '101st Precinct', '102nd Precinct', '103rd Precinct', '104th Precinct', '105th Precinct', '106th Precinct', '107th Precinct', '108th Precinct', '109th Precinct', '110th Precinct', '111th Precinct', '112th Precinct', '113th Precinct', '114th Precinct', '115th Precinct', '120th Precinct', '121st Precinct', '122nd Precinct', '123rd Precinct']

# extract desired columns from data
data = pd.read_csv('data.csv')
data1 = data[columns1]
data2 = data[columns2]

# standardize the data
stand_data1 = StandardScaler().fit_transform(data1)
stand_data2 = StandardScaler().fit_transform(data2)

# create instances of PCA
pca1 = PCA()
pca2 = PCA()

# apply PCA to standardized data
pca_data1 = pca1.fit_transform(stand_data1)
pca_data2 = pca2.fit_transform(stand_data2)

# convert PCA outputs to DataFrame
pca_df1 = pd.DataFrame(pca_data1[:, 0:2], columns=['PC1a', 'PC2a'])
pca_df2 = pd.DataFrame(pca_data2[:, 0:2], columns=['PC1b', 'PC2b'])

# take first two principal components
components1 = pca1.components_.T[:, 0:2]
components2 = pca2.components_.T[:, 0:2]

# concatenate data and PCA outputs
concat_data = pd.concat([data, pca_df1, pca_df2], axis=1)

print('Exporting to json file...')

# export everything needed for the dashboard as a single json file
with open('../../static/dashboard.json', 'w') as f:
    json.dump({'labels1': labels1,
               'labels2': labels2,
               'precinct_labels': precinct_labels,
               'data': concat_data.to_dict(orient='records'),
               'precincts1': pd.read_csv('precincts1.csv').to_dict(orient='records'),
               'precincts2': pd.read_csv('precincts2.csv').to_dict(orient='records'),
               'variance_ratio1': pca1.explained_variance_ratio_.tolist(),
               'variance_ratio2': pca2.explained_variance_ratio_.tolist(),
               'components1': components1.tolist(),
               'components2': components2.tolist()}, f)

print('Done!')