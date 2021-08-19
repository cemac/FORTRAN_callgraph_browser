info = ''' 
A script to parse fortran source code and generate a callgraph. 

Author: Daniel Ellis
Organisation: CEMAC, University of Leeds

Dependancies: 
    - fparser2
    - python 3
    - pandas

Usage:
    python -m processing -p /Users/wolfiex/UMTools/UMspyder/vn11.7/src/atmosphere/UKCA
    
    or for IPython
    
    run -m processing -p /Users/wolfiex/UMTools/UMspyder/vn11.7/src/atmosphere/UKCA
    
'''

# definitions
__version__='1.1.0'
__author__='D.Ellis'

# imports
import re,fparser,json,argparse
from fparser.two.parser import ParserFactory
from fparser.common.readfortran import FortranFileReader,FortranStringReader
from fparser.common.sourceinfo import FortranFormat
from fparser.api import parse
from pathlib import Path
from numpy import random
from tqdm import tqdm
import pandas as pd

##########################
## arguments
##########################
parser = argparse.ArgumentParser(description=info)

parser.add_argument('-p','--path',dest='path',type=str, help= 'location of fortran source code')
parser.add_argument('-n','--desc',dest='description',type=str, help= 'fortran source code name / description', nargs='?',default='undefined')
parser.add_argument('-s','--skip',dest='skip',type=str, help= 'which routine names to skip separated by a space. ', nargs='?',default='undefined')




args = parser.parse_args()
print(args)

# get a list of all paths
__loc__ = args.path
allpaths = list(Path(__loc__).rglob('*.F*'))
allpaths.extend(list(Path(__loc__).rglob('*.f*')))

skip = args.skip
if skip == 'undefined': skip = 'DR_HOOK EREPORT UMPRINT UMPRINTFLUSH'
skip = [i.upper() for i in skip.split()]
print('Ignoring names: ', ' | '.join(skip))
##########################
## functions
##########################

def ffind(n):
    '''Get the tree for a certain file number'''
    f90 = allpaths[n]
    reader = FortranFileReader(str(f90),ignore_comments=True)
    f2008_parser = ParserFactory().create(std="f2008")
    parse_tree = f2008_parser(reader)
    return parse_tree
    

def callhistory(x,chain=[]):
    '''Recursively generate the nested call history for a call'''
    y = x.parent
    yt = type(y)
    if yt == fparser.two.Fortran2003.Execution_Part: 
        chain.reverse()
        return chain
    else:
        chain.append(yt.__name__)
        return callhistory(y,chain)



##########################
## Begin Code forEach File
##########################

store = {} # main data
empty = [] # empty files not containing a module

for fn in tqdm(range(len(allpaths))):
    parse_tree_base = ffind(fn)
    try:
        modname = re.search(r"modulename\s*=\s*'(\w+)'",str(parse_tree_base),re.IGNORECASE).group(1)   
    except: 
        modname = ''
        
    routinesname = re.findall(r"routinename\s*=\s*'(\w+)'",str(parse_tree_base),re.IGNORECASE)

    case = [i.parent for i in fparser.two.utils.walk(parse_tree_base,types=fparser.two.Fortran2003.End_Subroutine_Stmt)]

    segments = dict(zip(routinesname,case))
    if len(routinesname) == 0 : empty.append(allpaths[fn])
    
    # status
    # print (fn, '/',len(allpaths), routinesname)

    f2008_parser = ParserFactory().create(std="f2008")


    for routine,content in segments.items():
        '''
        to read strings use reader else pass elements
        '''
        code = str(content)
        calls = fparser.two.utils.walk(content,types=fparser.two.Fortran2003.Call_Stmt) 
        
        links = {}
        hook = False
        
        if modname:
            origin = '%s:%s'%(modname,routine)
        else:
            origin = routine
            modname= ''
            
        for c in calls:        
            target = str(c.children[0]).upper()
            if target == 'DR_HOOK' :
                hook=True
                continue
            elif target in skip:
                continue
            

            chains = callhistory(c)
            cstr='-'.join(set(chains))
            
            links[target] = dict(chains=chains, source=origin.upper(),routine=routine.upper(), mod=modname, target=target, loop = 'Do' in cstr , condition = 'If' in cstr )

        store[routine] = dict(code=code, content=str(content),links=links, hook=hook, parent=origin)
        

##########################
## get information for each
##########################


data = []
for i in store:
    x = store[i]
    for j in x['links']:
        j = x['links'][j]
        data.append([j['routine'],j['target'],j['source'],j['mod'],j['loop'],j['condition']])


df = pd.DataFrame(data,columns='source target hookname module loop condition'.split()) 

del data

# filter out functions we want to avoid
df = df[[i not in skip for i in df.source]] 
df = df[[i not in skip for i in df.target]] 

ukca = set(df.source)
df['UKCA'] = [i in ukca for i in df.target]

io = re.compile(r'.*(PRINT|GET|READ|WRITE|FETCH).*')
df['IO'] = [ bool(io.match(i)) for i in df.source]

print('EMPTY',empty)

dfg = df.groupby(['source','target','hookname','module']).sum().reset_index() 

nds = []
for i in store:
    target = df[df.target==i].sum()
    st = store[i]
    nds.append([i, st['parent'], st['code'],st['hook'],bool(io.match(i)),bool(target.loop),bool(target.condition)]) 

for i in set(df.target) - set(store.keys()):
    nds.append([i, 'UNKNOWN', None,False,bool(io.match(i)),False,False]) 
    
dfn = pd.DataFrame(nds, columns = 'routine parent code hook io loop condition'.split())
dfn['x']= random.random(len(dfn))*100   
dfn['y']= random.random(len(dfn))*100 

share = {}
share['location']= __loc__
share['files'] = len(allpaths)
share['name'] = args.description
share['empty'] = len(empty)
share['routines'] = sum(dfn.hook>0)
share['version'] = re.findall("BASE_UM_REV='(.*)'",open( str(Path(__loc__).parents[2])+'/rose-stem/rose-suite.conf' ,'r').read())[0]

data = dict(nodes = dfn.T.to_json(), links = dfg.T.to_json(), share=share)

json.dump(data,open('fgraph.json','w'))

# 
# with open(savefile, 'wb') as picklefile:
#         pickle.dump(data, picklefile)


