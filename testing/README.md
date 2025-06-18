# Testing Directory

This directory contains testing scripts, reports, and analysis files created during development and maintenance of the Making and Knowing Edition.

## 🛠️ Testing Scripts

### Python Virtual Environment
```bash
# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Available Testing Scripts

#### 1. **Essay Audit** (`audit-essays.py`)
Comprehensive audit of all essays in the collection:
- File integrity checking
- Metadata completeness validation
- Content analysis (word count, images, structure)
- Thumbnail verification
- Abstract and bibliography checking

```bash
python audit-essays.py
```

#### 2. **Thumbnail Checker** (`check-thumbnails.py`)
Specialized thumbnail validation:
- Local thumbnail file existence
- S3 thumbnail URL accessibility
- Data source configuration validation
- Thumbnail inventory and statistics

```bash
python check-thumbnails.py
```

#### 3. **Structure Validator** (`validate-structure.py`)
HTML structure and content validation:
- Title and heading hierarchy
- Content organization and quality
- Image and figure validation
- Bibliography structure
- Link validation and accessibility

```bash
python validate-structure.py
```

#### 4. **Master Test Runner** (`run_all_tests.py`)
Runs all testing scripts and generates combined reports:
- Executes all validation scripts
- Generates summary statistics
- Creates combined test reports
- Provides overall system health status

```bash
python run_all_tests.py
```

## 📊 Reports and Results

### Static Reports
- `audit_summary_report.md` - Manual audit from June 18, 2025
- `requirements.txt` - Python dependencies

### Generated Reports
Scripts automatically generate timestamped reports:
- `audit_results_YYYYMMDD_HHMMSS.json` - Detailed audit data
- `audit_report_YYYYMMDD_HHMMSS.md` - Human-readable audit report
- `thumbnail_results_YYYYMMDD_HHMMSS.json` - Thumbnail validation data
- `thumbnail_report_YYYYMMDD_HHMMSS.md` - Thumbnail validation report
- `structure_results_YYYYMMDD_HHMMSS.json` - Structure validation data
- `structure_report_YYYYMMDD_HHMMSS.md` - Structure validation report
- `combined_test_results_YYYYMMDD_HHMMSS.json` - Combined test data
- `combined_test_report_YYYYMMDD_HHMMSS.md` - Combined test report

## 🔧 Configuration Changes Made
During the June 18, 2025 session:
1. **config.json**: Fixed rclone Google Drive connectivity (`sharedDrive: false`)
2. **lizard.js sync**: Successfully processed 4 new essays from Google Drive
3. **Server setup**: Configured React development environment

## 📈 Current System Status
- **134 total essays** in the collection
- **4 newly processed essays**: ann_304_ie_19, ann_310_ie_19, ann_319_ie_19, ann_327_ie_19
- **99.7% completeness** (only 4 missing DOIs)
- **Perfect file integrity** (no missing or corrupted files)

## 🔄 Usage Workflow

### Regular Testing
```bash
# Run all tests
python run_all_tests.py

# Run individual tests
python audit-essays.py
python check-thumbnails.py
python validate-structure.py
```

### After Content Updates
```bash
# After running lizard.js sync
python audit-essays.py

# After thumbnail changes
python check-thumbnails.py

# After HTML modifications
python validate-structure.py
```

## 🚫 Git Ignore

This directory is ignored by git (see `.gitignore`) and is meant for:
- Development testing and analysis
- Temporary reports and scripts
- Audit documentation
- Configuration testing

Files here should not be committed to the repository.